import { Effect, Layer, Option, Ref } from "effect"
import type {
  GymMembership,
} from "@gym/application/models/gym-membership"
import { GymMembershipRepository } from "@gym/application/repositories/gym-membership"

const membershipKey = (membership: GymMembership): string =>
  `${membership.gymId}\u0000${membership.memberId}`

export const GymMembershipInMemoryRepository = Layer.effect(
  GymMembershipRepository,
  Effect.gen(function* () {
    const store = yield* Ref.make(new Map<string, GymMembership>())

    return {
      findByMemberId: Effect.fn("GymMembershipRepository.findByMemberId")(
        function* (memberId) {
          const memberships = yield* Ref.get(store)

          return [...memberships.values()].filter(
            (membership) => membership.memberId === memberId
          )
        }
      ),

      insert: Effect.fn("GymMembershipRepository.insert")(
        function* (membership) {
          const key = membershipKey(membership)

          return yield* Ref.modify(store, (memberships) => {
            if (memberships.has(key)) {
              return [Option.none(), memberships]
            }

            const next = new Map(memberships)
            next.set(key, membership)
            return [Option.some(membership), next]
          })
        }
      ),
    }
  })
)
