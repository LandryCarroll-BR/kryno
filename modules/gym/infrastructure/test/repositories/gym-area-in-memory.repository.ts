import { Effect, Layer, Option, Ref } from "effect"
import type { GymArea } from "@gym/application/models/gym-area"
import { GymAreaRepository } from "@gym/application/repositories/gym-area"

export const GymAreaInMemoryRepository = Layer.effect(
  GymAreaRepository,
  Effect.gen(function* () {
    const store = yield* Ref.make(new Map<string, GymArea>())

    return {
      findByGymId: Effect.fn("GymAreaRepository.findByGymId")(
        function* (gymId) {
          const areas = yield* Ref.get(store)
          return [...areas.values()]
            .filter((area) => area.gymId === gymId)
            .sort(
              (left, right) =>
                left.name.localeCompare(right.name) ||
                left.id.localeCompare(right.id)
            )
        }
      ),

      findById: Effect.fn("GymAreaRepository.findById")(
        function* (areaId) {
          const areas = yield* Ref.get(store)
          return Option.fromNullishOr(areas.get(areaId))
        }
      ),

      insert: Effect.fn("GymAreaRepository.insert")(function* (area) {
        return yield* Ref.modify(store, (areas) => {
          const duplicate = [...areas.values()].some(
            (candidate) =>
              candidate.gymId === area.gymId &&
              candidate.name.toLocaleLowerCase() ===
                area.name.toLocaleLowerCase()
          )

          if (duplicate) {
            return [Option.none<GymArea>(), areas]
          }

          const next = new Map(areas)
          next.set(area.id, area)
          return [Option.some(area), next]
        })
      }),
    }
  })
)
