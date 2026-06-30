import { and, asc, desc, eq } from "drizzle-orm"
import { Effect, Layer, Option, Schema } from "effect"

import { Boulder } from "@climbing/application/models/boulder"
import { BoulderRepository } from "@climbing/application/repositories/boulder"

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
      deleteByCreatorClimberId: Effect.fn(
        "BoulderRepository.deleteByCreatorClimberId"
      )(function* (climberId, boulderId) {
        const [deleted] = yield* db
          .delete(bouldersTable)
          .where(
            and(
              eq(bouldersTable.creatorClimberId, climberId),
              eq(bouldersTable.id, boulderId)
            )
          )
          .returning()
          .pipe(Effect.orDie)

        return Option.fromNullishOr(deleted).pipe(Option.map(toBoulder))
      }),

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

      findById: Effect.fn("BoulderRepository.findById")(
        function* (boulderId) {
          const [boulder] = yield* db
            .select()
            .from(bouldersTable)
            .where(eq(bouldersTable.id, boulderId))
            .limit(1)
            .pipe(Effect.orDie)

          return Option.fromNullishOr(boulder).pipe(Option.map(toBoulder))
        }
      ),

      findSavedById: Effect.fn("BoulderRepository.findSavedById")(
        function* (climberId, boulderId) {
          const [boulder] = yield* db
            .select()
            .from(bouldersTable)
            .where(
              and(
                eq(bouldersTable.creatorClimberId, climberId),
                eq(bouldersTable.id, boulderId)
              )
            )
            .limit(1)
            .pipe(Effect.orDie)

          return Option.fromNullishOr(boulder).pipe(Option.map(toBoulder))
        }
      ),

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
