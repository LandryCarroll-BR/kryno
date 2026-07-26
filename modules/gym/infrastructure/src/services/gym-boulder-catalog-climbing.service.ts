import { Effect, Layer } from "effect"
import { Climbing } from "@climbing/component"
import { UnauthenticatedGymAdministratorError } from "@gym/application/errors/gym"
import {
  type AssignableGymBoulder,
  GymBoulderCatalog,
} from "@gym/application/services/gym-boulder-catalog"

export const GymBoulderCatalogClimbing = Layer.effect(
  GymBoulderCatalog,
  Effect.gen(function* () {
    const climbing = yield* Climbing

    const toAssignableBoulder = ({
      id,
      name,
      grade,
      color,
      wallAngle,
      movementStyle,
    }: AssignableGymBoulder): AssignableGymBoulder => ({
      id,
      name,
      grade,
      color,
      wallAngle,
      movementStyle,
    })

    return {
      createOwned: Effect.fn("GymBoulderCatalog.createOwned")(
        function* ({ token, name, grade, color, wallAngle, movementStyle }) {
          return yield* climbing
            .createBoulder({
              token,
              name,
              grade,
              color,
              wallAngle,
              movementStyle,
            })
            .pipe(
              Effect.map(toAssignableBoulder),
              Effect.catchTags({
                SchemaError: Effect.die,
                UnauthenticatedClimberError: () =>
                  new UnauthenticatedGymAdministratorError(),
              })
            )
        }
      ),

      deleteOwned: Effect.fn("GymBoulderCatalog.deleteOwned")(
        function* ({ token, boulderId }) {
          yield* climbing
            .deleteBoulder({ token, boulderId })
            .pipe(Effect.catch(() => Effect.void))
        }
      ),

      getByIds: Effect.fn("GymBoulderCatalog.getByIds")(
        function* (boulderIds) {
          const boulders = yield* climbing
            .getBouldersByIds({ boulderIds: [...boulderIds] })
            .pipe(Effect.orDie)

          return boulders.map(toAssignableBoulder)
        }
      ),

      listOwned: Effect.fn("GymBoulderCatalog.listOwned")(function* (token) {
        const created = yield* climbing
          .listCreatedBoulders({ token })
          .pipe(Effect.orDie)

        return created.map(({ boulder }) => toAssignableBoulder(boulder))
      }),
    }
  })
)
