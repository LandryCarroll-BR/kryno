import { Effect, Layer, Ref } from "effect"
import {
  BoulderGrade,
  BoulderId,
  BoulderName,
  BoulderColor,
  MovementStyle,
  WallAngle,
} from "@climbing/application/models/boulder"
import { GymBoulderCatalog } from "@gym/application/services/gym-boulder-catalog"

const boulders = [
  {
    id: BoulderId.make("admin-boulder-1"),
    name: BoulderName.make("Blue 12"),
    grade: BoulderGrade.make("V4"),
    color: BoulderColor.make("BLUE"),
    wallAngle: WallAngle.make("OVERHANG"),
    movementStyle: MovementStyle.make("POWER"),
  },
  {
    id: BoulderId.make("admin-boulder-2"),
    name: BoulderName.make("Red 7"),
    grade: BoulderGrade.make("V6"),
    color: BoulderColor.make("RED"),
    wallAngle: WallAngle.make("VERTICAL"),
    movementStyle: MovementStyle.make("TECHNICAL"),
  },
] as const

export const GymBoulderCatalogTest = Layer.effect(
  GymBoulderCatalog,
  Effect.gen(function* () {
    const store = yield* Ref.make([...boulders])
    const counter = yield* Ref.make(1)

    return {
      createOwned: Effect.fn("GymBoulderCatalog.createOwned")(
        function* ({ name, grade, color, wallAngle, movementStyle }) {
          const id = yield* Ref.getAndUpdate(counter, (value) => value + 1).pipe(
            Effect.map((value) => BoulderId.make(`created-boulder-${value}`))
          )
          const boulder = {
            id,
            name,
            grade,
            color,
            wallAngle,
            movementStyle,
          }

          yield* Ref.update(store, (current) => [...current, boulder])
          return boulder
        }
      ),

      deleteOwned: Effect.fn("GymBoulderCatalog.deleteOwned")(
        function* ({ boulderId }) {
          yield* Ref.update(store, (current) =>
            current.filter(({ id }) => id !== boulderId)
          )
        }
      ),

      getByIds: Effect.fn("GymBoulderCatalog.getByIds")(function* (boulderIds) {
        const current = yield* Ref.get(store)
        const included = new Set(boulderIds)
        return current.filter(({ id }) => included.has(id))
      }),

      listOwned: Effect.fn("GymBoulderCatalog.listOwned")(function* (token) {
        const current = yield* Ref.get(store)
        return token === "admin-token" ? current : []
      }),
    }
  })
)
