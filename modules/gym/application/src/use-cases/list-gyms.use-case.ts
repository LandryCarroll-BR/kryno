import { Effect, Layer, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import type { UnauthenticatedGymMemberError } from "../errors/gym-membership.errors"
import type { Gym } from "../models/gym.models"
import { GymMembershipRepository } from "../repositories/gym-membership.repository"
import { GymRepository } from "../repositories/gym.repository"
import { AuthenticatedGymMember } from "../services/authenticated-gym-member.service"

export const ListGymsInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
}).annotate({ identifier: "ListGymsInput" })

export type ListGymsInput = typeof ListGymsInputSchema.Type
export type ListedGym = {
  readonly gym: Gym
  readonly isMember: boolean
}
export type ListGymsOutput = readonly ListedGym[]

export class ListGymsUseCase extends Service<
  ListGymsUseCase,
  {
    readonly execute: (
      input: ListGymsInput
    ) => Effect.Effect<
      ListGymsOutput,
      SchemaError | UnauthenticatedGymMemberError
    >
  }
>()("@gym/application/ListGymsUseCase") {
  static Live = Layer.effect(
    ListGymsUseCase,
    Effect.gen(function* () {
      const authenticatedGymMember = yield* AuthenticatedGymMember
      const gymRepository = yield* GymRepository
      const gymMembershipRepository = yield* GymMembershipRepository

      return {
        execute: Effect.fn("ListGymsUseCase.execute")(function* (input) {
          const parsedInput = yield* Schema.decodeUnknownEffect(
            ListGymsInputSchema
          )(input, { errors: "all" })
          const memberId = yield* authenticatedGymMember.resolve(
            parsedInput.token
          )
          const gyms = yield* gymRepository.findAll()
          const memberships =
            yield* gymMembershipRepository.findByMemberId(memberId)
          const joinedGymIds = new Set(
            memberships.map((membership) => membership.gymId)
          )

          return [...gyms]
            .sort((left, right) => left.name.localeCompare(right.name))
            .map((gym) => ({
              gym,
              isMember: joinedGymIds.has(gym.id),
            }))
        }),
      }
    })
  )
}
