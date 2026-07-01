import { Effect, Layer } from "effect"
import { Climbing } from "@climbing/component"
import { GymBoulderCatalog } from "@gym/application/services/gym-boulder-catalog"

export const GymBoulderCatalogClimbing = Layer.effect(
  GymBoulderCatalog,
  Effect.gen(function* () {
    const climbing = yield* Climbing

    return {
      listOwned: Effect.fn("GymBoulderCatalog.listOwned")(function* (token) {
        const created = yield* climbing
          .listCreatedBoulders({ token })
          .pipe(Effect.orDie)

        return created.map(({ boulder }) => ({
          id: boulder.id,
          name: boulder.name,
          grade: boulder.grade,
        }))
      }),
    }
  })
)
