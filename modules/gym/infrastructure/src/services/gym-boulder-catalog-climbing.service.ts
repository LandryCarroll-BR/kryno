import { Effect, Layer } from "effect"
import { Climbing } from "@climbing/component"
import { GymBoulderCatalog } from "@gym/application/services/gym-boulder-catalog"

export const GymBoulderCatalogClimbing = Layer.effect(
  GymBoulderCatalog,
  Effect.gen(function* () {
    const climbing = yield* Climbing

    return {
      getByIds: Effect.fn("GymBoulderCatalog.getByIds")(
        function* (boulderIds) {
          const boulders = yield* climbing
            .getBouldersByIds({ boulderIds: [...boulderIds] })
            .pipe(Effect.orDie)

          return boulders.map(
            ({ id, name, grade, wallAngle, movementStyle }) => ({
              id,
              name,
              grade,
              wallAngle,
              movementStyle,
            })
          )
        }
      ),

      listOwned: Effect.fn("GymBoulderCatalog.listOwned")(function* (token) {
        const created = yield* climbing
          .listCreatedBoulders({ token })
          .pipe(Effect.orDie)

        return created.map(
          ({ boulder: { id, name, grade, wallAngle, movementStyle } }) => ({
            id,
            name,
            grade,
            wallAngle,
            movementStyle,
          })
        )
      }),
    }
  })
)
