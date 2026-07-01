import { asc, eq } from "drizzle-orm"
import { Effect, Layer, Option, Schema } from "effect"
import { GymArea } from "@gym/application/models/gym-area"
import { GymAreaRepository } from "@gym/application/repositories/gym-area"

import { GymDB } from "../db/context"
import { gymAreasTable } from "../schemas/gym-areas.schema"

const toGymArea = (
  row: typeof gymAreasTable.$inferSelect
): GymArea => Schema.decodeUnknownSync(GymArea)(row)

export const GymAreaDBRepository = Layer.effect(
  GymAreaRepository,
  Effect.gen(function* () {
    const db = yield* GymDB

    return {
      findByGymId: Effect.fn("GymAreaRepository.findByGymId")(
        function* (gymId) {
          const areas = yield* db
            .select()
            .from(gymAreasTable)
            .where(eq(gymAreasTable.gymId, gymId))
            .orderBy(asc(gymAreasTable.name), asc(gymAreasTable.id))
            .pipe(Effect.orDie)

          return areas.map(toGymArea)
        }
      ),

      findById: Effect.fn("GymAreaRepository.findById")(
        function* (areaId) {
          const [area] = yield* db
            .select()
            .from(gymAreasTable)
            .where(eq(gymAreasTable.id, areaId))
            .limit(1)
            .pipe(Effect.orDie)

          return Option.fromNullishOr(area).pipe(Option.map(toGymArea))
        }
      ),

      insert: Effect.fn("GymAreaRepository.insert")(function* (area) {
        const [created] = yield* db
          .insert(gymAreasTable)
          .values(area)
          .onConflictDoNothing()
          .returning()
          .pipe(Effect.orDie)

        return Option.fromNullishOr(created).pipe(Option.map(toGymArea))
      }),
    }
  })
)
