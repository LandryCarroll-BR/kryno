import { asc, desc, eq } from "drizzle-orm"
import { Effect, Layer, Schema } from "effect"

import { Boulder, BoulderRepository } from "@climbing/application"

import { ClimbingDB } from "../db/context"
import { bouldersTable } from "../schemas/boulder.schema"

const toBoulder = (row: typeof bouldersTable.$inferSelect): Boulder =>
  Schema.decodeUnknownSync(Boulder)({
    id: row.id,
    creatorClimberId: row.creatorClimberId,
    name: row.name,
    grade: row.grade,
    wallAngle: row.wallAngle,
    movementStyle: row.movementStyle,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })

export const BoulderDBRepository = Layer.effect(
  BoulderRepository,
  Effect.gen(function* () {
    const db = yield* ClimbingDB

    return {
      findByCreatorClimberId: Effect.fn(
        "BoulderRepository.findByCreatorClimberId"
      )(function* (climberId) {
        const boulders = yield* db
          .select()
          .from(bouldersTable)
          .where(eq(bouldersTable.creatorClimberId, climberId))
          .orderBy(desc(bouldersTable.updatedAt), asc(bouldersTable.name))
          .pipe(Effect.orDie)

        return boulders.map(toBoulder)
      }),

      insert: Effect.fn("BoulderRepository.insert")(function* (boulder) {
        const [created] = yield* db
          .insert(bouldersTable)
          .values({
            id: boulder.id,
            creatorClimberId: boulder.creatorClimberId,
            name: boulder.name,
            grade: boulder.grade,
            wallAngle: boulder.wallAngle,
            movementStyle: boulder.movementStyle,
            createdAt: boulder.createdAt,
            updatedAt: boulder.updatedAt,
          })
          .returning()
          .pipe(Effect.orDie)

        if (created === undefined) {
          return yield* Effect.die(
            new Error("Boulder insertion returned no created row.")
          )
        }

        return toBoulder(created)
      }),
    }
  })
)
