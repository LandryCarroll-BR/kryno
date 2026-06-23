import { Effect, Layer, Ref } from "effect"
import { BoulderRepository, type Boulder } from "@climbing/application"

export const BoulderInMemoryRepository = Layer.effect(
  BoulderRepository,
  Effect.gen(function* () {
    const store = yield* Ref.make(new Map<string, Boulder>())

    return {
      findByCreatorClimberId: Effect.fn(
        "BoulderRepository.findByCreatorClimberId"
      )(function* (climberId) {
        const boulders = yield* Ref.get(store)

        return [...boulders.values()]
          .filter((boulder) => boulder.creatorClimberId === climberId)
          .toSorted((left, right) => {
            const updatedAt = right.updatedAt.getTime() - left.updatedAt.getTime()

            if (updatedAt !== 0) {
              return updatedAt
            }

            return left.name.localeCompare(right.name)
          })
      }),

      insert: Effect.fn("BoulderRepository.insert")(function* (boulder) {
        return yield* Ref.update(store, (boulders) => {
          const next = new Map(boulders)
          next.set(boulder.id, boulder)
          return next
        }).pipe(Effect.as(boulder))
      }),
    }
  })
)
