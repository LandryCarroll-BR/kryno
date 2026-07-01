import { asc, eq } from "drizzle-orm"
import { Effect, Layer, Option, Schema } from "effect"
import { Gym } from "@gym/application/models/gym"
import { GymRepository } from "@gym/application/repositories/gym"

import { GymDB } from "../db/context"
import { gymsTable } from "../schemas/gyms.schema"

const toGym = (row: typeof gymsTable.$inferSelect): Gym =>
  Schema.decodeUnknownSync(Gym)({
    id: row.id,
    name: row.name,
  })

export const GymDBRepository = Layer.effect(
  GymRepository,
  Effect.gen(function* () {
    const db = yield* GymDB

    return {
      findAll: Effect.fn("GymRepository.findAll")(function* () {
        const gyms = yield* db
          .select()
          .from(gymsTable)
          .orderBy(asc(gymsTable.name), asc(gymsTable.id))
          .pipe(Effect.orDie)

        return gyms.map(toGym)
      }),

      findById: Effect.fn("GymRepository.findById")(function* (gymId) {
        const [gym] = yield* db
          .select()
          .from(gymsTable)
          .where(eq(gymsTable.id, gymId))
          .limit(1)
          .pipe(Effect.orDie)

        return Option.fromNullishOr(gym).pipe(Option.map(toGym))
      }),

      insert: Effect.fn("GymRepository.insert")(function* (gym) {
        const [created] = yield* db
          .insert(gymsTable)
          .values({
            id: gym.id,
            name: gym.name,
          })
          .returning()
          .pipe(Effect.orDie)

        if (created === undefined) {
          return yield* Effect.die(
            new Error("Gym insertion returned no created row.")
          )
        }

        return toGym(created)
      }),
    }
  })
)
