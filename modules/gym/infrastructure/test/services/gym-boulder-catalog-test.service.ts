import { Effect, Layer } from "effect"
import {
  BoulderGrade,
  BoulderId,
  BoulderName,
  MovementStyle,
  WallAngle,
} from "@climbing/application/models/boulder"
import { GymBoulderCatalog } from "@gym/application/services/gym-boulder-catalog"

const boulders = [
  {
    id: BoulderId.make("admin-boulder-1"),
    name: BoulderName.make("Blue 12"),
    grade: BoulderGrade.make("V4"),
    wallAngle: WallAngle.make("OVERHANG"),
    movementStyle: MovementStyle.make("POWER"),
  },
  {
    id: BoulderId.make("admin-boulder-2"),
    name: BoulderName.make("Red 7"),
    grade: BoulderGrade.make("V6"),
    wallAngle: WallAngle.make("VERTICAL"),
    movementStyle: MovementStyle.make("TECHNICAL"),
  },
] as const

export const GymBoulderCatalogTest = Layer.succeed(GymBoulderCatalog, {
  getByIds: Effect.fn("GymBoulderCatalog.getByIds")((boulderIds) => {
    const included = new Set(boulderIds)
    return Effect.succeed(boulders.filter(({ id }) => included.has(id)))
  }),

  listOwned: Effect.fn("GymBoulderCatalog.listOwned")((token) =>
    Effect.succeed(token === "admin-token" ? boulders : [])
  ),
})
