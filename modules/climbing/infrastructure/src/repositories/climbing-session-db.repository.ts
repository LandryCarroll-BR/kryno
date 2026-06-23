import { and, eq, isNull } from "drizzle-orm"
import { Effect, Layer, Option } from "effect"

import {
  ActiveClimbingSession,
  ClimbingSessionRepository,
  CompletedClimbingSession,
} from "@climbing/application"

import { ClimbingDB } from "../db/context"
import { climbingSessionsTable } from "../schemas/climbing-session.schema"

const toActiveSession = (
  row: typeof climbingSessionsTable.$inferSelect
): ActiveClimbingSession =>
  ActiveClimbingSession.make({
    id: row.id,
    climberId: row.climberId,
    attempts: [],
    startedAt: row.startedAt,
  })

const toCompletedSession = (
  row: typeof climbingSessionsTable.$inferSelect & { endedAt: Date }
): CompletedClimbingSession =>
  CompletedClimbingSession.make({
    id: row.id,
    climberId: row.climberId,
    attempts: [],
    startedAt: row.startedAt,
    endedAt: row.endedAt,
  })

export const ClimbingSessionDBRepository = Layer.effect(
  ClimbingSessionRepository,
  Effect.gen(function* () {
    const db = yield* ClimbingDB

    return {
      findActiveByClimberId: Effect.fn(
        "ClimbingSessionRepository.findActiveByClimberId"
      )(function* (climberId) {
        const [session] = yield* db
          .select()
          .from(climbingSessionsTable)
          .where(
            and(
              eq(climbingSessionsTable.climberId, climberId),
              isNull(climbingSessionsTable.endedAt)
            )
          )
          .limit(1)
          .pipe(Effect.orDie)

        return Option.fromNullishOr(session).pipe(Option.map(toActiveSession))
      }),

      insertActive: Effect.fn("ClimbingSessionRepository.insertActive")(
        function* (session) {
          const [created] = yield* db
            .insert(climbingSessionsTable)
            .values({
            id: session.id,
            climberId: session.climberId,
            startedAt: session.startedAt,
            endedAt: null,
            createdAt: session.startedAt,
            updatedAt: session.startedAt,
          })
            .onConflictDoNothing()
            .returning()
            .pipe(Effect.orDie)

          return Option.fromNullishOr(created).pipe(Option.map(toActiveSession))
        }
      ),

      endActiveByClimberId: Effect.fn(
        "ClimbingSessionRepository.endActiveByClimberId"
      )(function* (climberId, endedAt) {
        const [ended] = yield* db
          .update(climbingSessionsTable)
          .set({ endedAt, updatedAt: endedAt })
          .where(
            and(
              eq(climbingSessionsTable.climberId, climberId),
              isNull(climbingSessionsTable.endedAt)
            )
          )
          .returning()
          .pipe(Effect.orDie)

        if (ended === undefined) {
          return Option.none()
        }

        if (ended.endedAt === null) {
          return yield* Effect.die(
            new Error("Ended climbing session update returned a null endedAt.")
          )
        }

        return Option.some(
          toCompletedSession({ ...ended, endedAt: ended.endedAt })
        )
      }),
    }
  })
)
