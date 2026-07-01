import { Effect, Layer } from "effect"
import {
  BoulderGrade,
  BoulderId,
  BoulderName,
} from "@climbing/application/models/boulder"
import { GymBoulderCatalog } from "@gym/application/services/gym-boulder-catalog"

export const GymBoulderCatalogTest = Layer.succeed(GymBoulderCatalog, {
  listOwned: Effect.fn("GymBoulderCatalog.listOwned")((token) =>
    Effect.succeed(
      token === "admin-token"
        ? [
            {
              id: BoulderId.make("admin-boulder-1"),
              name: BoulderName.make("Blue 12"),
              grade: BoulderGrade.make("V4"),
            },
            {
              id: BoulderId.make("admin-boulder-2"),
              name: BoulderName.make("Red 7"),
              grade: BoulderGrade.make("V6"),
            },
          ]
        : []
    )
  ),
})
