import { DateTime, Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import {
  GymMembershipAlreadyExistsError,
  GymNotFoundError,
  type UnauthenticatedGymMemberError,
} from "../errors/gym-membership.errors"
import { GymMembership } from "../models/gym-membership.models"
import { GymId, type Gym } from "../models/gym.models"
import { GymMembershipRepository } from "../repositories/gym-membership.repository"
import { GymRepository } from "../repositories/gym.repository"
import { AuthenticatedGymMember } from "../services/authenticated-gym-member.service"

export const JoinGymInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
  gymId: GymId,
}).annotate({ identifier: "JoinGymInput" })

export type JoinGymInput = typeof JoinGymInputSchema.Type
export type JoinGymOutput = {
  readonly gym: Gym
  readonly membership: GymMembership
}

export class JoinGymUseCase extends Service<
  JoinGymUseCase,
  {
    readonly execute: (
      input: JoinGymInput
    ) => Effect.Effect<
      JoinGymOutput,
      | SchemaError
      | UnauthenticatedGymMemberError
      | GymNotFoundError
      | GymMembershipAlreadyExistsError
    >
  }
>()("@gym/application/JoinGymUseCase") {
  static Live = Layer.effect(
    JoinGymUseCase,
    Effect.gen(function* () {
      const authenticatedGymMember = yield* AuthenticatedGymMember
      const gymRepository = yield* GymRepository
      const gymMembershipRepository = yield* GymMembershipRepository

      return {
        execute: Effect.fn("JoinGymUseCase.execute")(function* (input) {
          const parsedInput = yield* Schema.decodeUnknownEffect(
            JoinGymInputSchema
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

          const joinedAt = yield* DateTime.nowAsDate
          const membership = GymMembership.make({
            gymId: parsedInput.gymId,
            memberId,
            joinedAt,
          })
          const inserted = yield* gymMembershipRepository.insert(membership)

          if (Option.isNone(inserted)) {
            return yield* new GymMembershipAlreadyExistsError({
              gymId: parsedInput.gymId,
              memberId,
            })
          }

          return {
            gym: gym.value,
            membership: inserted.value,
          }
        }),
      }
    })
  )
}
