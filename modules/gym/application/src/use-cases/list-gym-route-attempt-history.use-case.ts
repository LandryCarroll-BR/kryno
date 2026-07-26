import { Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"
import type { ClimbingAttempt } from "@climbing/application/models/climbing-attempt"

import type { AssignableGymBoulder } from "../services/gym-boulder-catalog.service"
import {
  GymMembershipRequiredError,
  GymNotFoundError,
  type UnauthenticatedGymMemberError,
} from "../errors/gym-membership.errors"
import type { GymArea } from "../models/gym-area.models"
import type { GymRoute } from "../models/gym-route.models"
import { GymId, type Gym } from "../models/gym.models"
import { GymAreaRepository } from "../repositories/gym-area.repository"
import { GymMembershipRepository } from "../repositories/gym-membership.repository"
import { GymRouteRepository } from "../repositories/gym-route.repository"
import { GymRepository } from "../repositories/gym.repository"
import { AuthenticatedGymMember } from "../services/authenticated-gym-member.service"
import { GymBoulderAttempts } from "../services/gym-boulder-attempts.service"
import { GymBoulderCatalog } from "../services/gym-boulder-catalog.service"

export const ListGymRouteAttemptHistoryInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
  gymId: GymId,
}).annotate({ identifier: "ListGymRouteAttemptHistoryInput" })

export type ListGymRouteAttemptHistoryInput =
  typeof ListGymRouteAttemptHistoryInputSchema.Type

export type GymRouteWithBoulderAttemptHistory = {
  readonly route: GymRoute
  readonly boulder: Option.Option<AssignableGymBoulder>
  readonly attempts: readonly ClimbingAttempt[]
}

export type GymAreaWithRouteAttemptHistory = {
  readonly area: GymArea
  readonly routes: readonly GymRouteWithBoulderAttemptHistory[]
}

export type ListGymRouteAttemptHistoryOutput = {
  readonly gym: Gym
  readonly isMember: boolean
  readonly areas: readonly GymAreaWithRouteAttemptHistory[]
}

export class ListGymRouteAttemptHistoryUseCase extends Service<
  ListGymRouteAttemptHistoryUseCase,
  {
    readonly execute: (
      input: ListGymRouteAttemptHistoryInput
    ) => Effect.Effect<
      ListGymRouteAttemptHistoryOutput,
      | SchemaError
      | UnauthenticatedGymMemberError
      | GymNotFoundError
      | GymMembershipRequiredError
    >
  }
>()("@gym/application/ListGymRouteAttemptHistoryUseCase") {
  static Live = Layer.effect(
    ListGymRouteAttemptHistoryUseCase,
    Effect.gen(function* () {
      const authenticatedGymMember = yield* AuthenticatedGymMember
      const gymRepository = yield* GymRepository
      const membershipRepository = yield* GymMembershipRepository
      const areaRepository = yield* GymAreaRepository
      const routeRepository = yield* GymRouteRepository
      const boulderCatalog = yield* GymBoulderCatalog
      const boulderAttempts = yield* GymBoulderAttempts

      return {
        execute: Effect.fn("ListGymRouteAttemptHistoryUseCase.execute")(
          function* (input) {
            const parsedInput = yield* Schema.decodeUnknownEffect(
              ListGymRouteAttemptHistoryInputSchema
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
              return {
                gym: gym.value,
                isMember: false,
                areas: [],
              }
            }

            const areas = yield* areaRepository.findByGymId(parsedInput.gymId)
            const routes = yield* routeRepository.findByAreaIds(
              areas.map(({ id }) => id)
            )
            const boulders = yield* boulderCatalog.getByIds(
              routes.map(({ boulderId }) => boulderId)
            )
            const bouldersById = new Map(
              boulders.map((boulder) => [boulder.id, boulder])
            )
            const histories = yield* boulderAttempts.listForBoulders({
              token: parsedInput.token,
              memberId,
              boulderIds: routes.map(({ boulderId }) => boulderId),
            })
            const attemptsByBoulderId = new Map(
              histories.map((history) => [
                history.boulderId,
                history.sessions.flatMap(({ attempts }) => attempts),
              ])
            )

            return {
              gym: gym.value,
              isMember: true,
              areas: areas.map((area) => ({
                area,
                routes: routes
                  .filter(({ areaId }) => areaId === area.id)
                  .map((route) => ({
                    route,
                    boulder: Option.fromNullishOr(
                      bouldersById.get(route.boulderId)
                    ),
                    attempts: attemptsByBoulderId.get(route.boulderId) ?? [],
                  })),
              })),
            }
          }
        ),
      }
    })
  )
}
