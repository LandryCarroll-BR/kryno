import { Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"
import {
  ClimbingAttemptOutcome,
} from "@climbing/application/models/climbing-attempt"
import type { BoulderId } from "@climbing/application/models/boulder"

import type { NoActiveGymClimbingSessionError } from "../errors/gym-climbing.errors"
import {
  GymMembershipRequiredError,
  GymNotFoundError,
  type UnauthenticatedGymMemberError,
} from "../errors/gym-membership.errors"
import {
  type GymRouteBoulderUnavailableError,
  GymRouteNotFoundError,
} from "../errors/gym-route.errors"
import { GymRouteId } from "../models/gym-route.models"
import { GymId } from "../models/gym.models"
import { GymAreaRepository } from "../repositories/gym-area.repository"
import { GymMembershipRepository } from "../repositories/gym-membership.repository"
import { GymRouteRepository } from "../repositories/gym-route.repository"
import { GymRepository } from "../repositories/gym.repository"
import { AuthenticatedGymMember } from "../services/authenticated-gym-member.service"
import { GymBoulderAttempts } from "../services/gym-boulder-attempts.service"

export const LogGymRouteAttemptInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
  gymId: GymId,
  routeId: GymRouteId,
  outcome: ClimbingAttemptOutcome,
}).annotate({ identifier: "LogGymRouteAttemptInput" })

export type LogGymRouteAttemptInput =
  typeof LogGymRouteAttemptInputSchema.Type
export type LoggedGymRouteAttempt = {
  readonly id: string
  readonly boulderId: BoulderId
  readonly ordinal: number
  readonly outcome: typeof ClimbingAttemptOutcome.Type
  readonly occurredAt: Date
}
export type LogGymRouteAttemptOutput = {
  readonly gymId: GymId
  readonly routeId: GymRouteId
  readonly attempt: LoggedGymRouteAttempt
}

export class LogGymRouteAttemptUseCase extends Service<
  LogGymRouteAttemptUseCase,
  {
    readonly execute: (
      input: LogGymRouteAttemptInput
    ) => Effect.Effect<
      LogGymRouteAttemptOutput,
      | SchemaError
      | UnauthenticatedGymMemberError
      | GymNotFoundError
      | GymMembershipRequiredError
      | GymRouteNotFoundError
      | GymRouteBoulderUnavailableError
      | NoActiveGymClimbingSessionError
    >
  }
>()("@gym/application/LogGymRouteAttemptUseCase") {
  static Live = Layer.effect(
    LogGymRouteAttemptUseCase,
    Effect.gen(function* () {
      const authenticatedGymMember = yield* AuthenticatedGymMember
      const gymRepository = yield* GymRepository
      const membershipRepository = yield* GymMembershipRepository
      const areaRepository = yield* GymAreaRepository
      const routeRepository = yield* GymRouteRepository
      const boulderAttempts = yield* GymBoulderAttempts

      return {
        execute: Effect.fn("LogGymRouteAttemptUseCase.execute")(
          function* (input) {
            const parsedInput = yield* Schema.decodeUnknownEffect(
              LogGymRouteAttemptInputSchema
            )(input, { errors: "all" })
            const memberId = yield* authenticatedGymMember.resolve(
              parsedInput.token
            )
            const gym = yield* gymRepository.findById(parsedInput.gymId)

            if (Option.isNone(gym)) {
              return yield* new GymNotFoundError({
                gymId: parsedInput.gymId,
              })
            }

            const membership =
              yield* membershipRepository.findByGymIdAndMemberId(
                parsedInput.gymId,
                memberId
              )
            if (Option.isNone(membership)) {
              return yield* new GymMembershipRequiredError({
                gymId: parsedInput.gymId,
                memberId,
              })
            }

            const route = yield* routeRepository.findById(
              parsedInput.routeId
            )
            if (Option.isNone(route)) {
              return yield* new GymRouteNotFoundError({
                gymId: parsedInput.gymId,
                routeId: parsedInput.routeId,
              })
            }

            const area = yield* areaRepository.findById(route.value.areaId)
            if (
              Option.isNone(area) ||
              area.value.gymId !== parsedInput.gymId
            ) {
              return yield* new GymRouteNotFoundError({
                gymId: parsedInput.gymId,
                routeId: parsedInput.routeId,
              })
            }

            const attempt = yield* boulderAttempts.log({
              token: parsedInput.token,
              memberId,
              routeId: route.value.id,
              boulderId: route.value.boulderId,
              outcome: parsedInput.outcome,
            })

            return {
              gymId: parsedInput.gymId,
              routeId: route.value.id,
              attempt,
            }
          }
        ),
      }
    })
  )
}
