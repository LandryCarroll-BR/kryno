import { Effect, Layer, Option, Ref } from "effect"
import type { Gym } from "@gym/application/models/gym"
import { GymRepository } from "@gym/application/repositories/gym"

export const GymInMemoryRepository = Layer.effect(
  GymRepository,
  Effect.gen(function* () {
    const store = yield* Ref.make(new Map<string, Gym>())

    return {
      findAll: Effect.fn("GymRepository.findAll")(function* () {
        const gyms = yield* Ref.get(store)
        return [...gyms.values()]
      }),

      findById: Effect.fn("GymRepository.findById")(function* (gymId) {
        const gyms = yield* Ref.get(store)
        return Option.fromNullishOr(gyms.get(gymId))
      }),

      insert: Effect.fn("GymRepository.insert")(function* (gym) {
        return yield* Ref.update(store, (gyms) => {
          const next = new Map(gyms)
          next.set(gym.id, gym)
          return next
        }).pipe(Effect.as(gym))
      }),
    }
  })
)
