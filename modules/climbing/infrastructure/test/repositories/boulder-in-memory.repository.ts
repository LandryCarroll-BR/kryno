import { Effect, Layer, Ref } from "effect"
import { BoulderRepository, type Boulder } from "@climbing/application"

export const BoulderInMemoryRepository = Layer.effect(
  BoulderRepository,
  Effect.gen(function* () {
    const store = yield* Ref.make(new Map<string, Boulder>())

    return {
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
