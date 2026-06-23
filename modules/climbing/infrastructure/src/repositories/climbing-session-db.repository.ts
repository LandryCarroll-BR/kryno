import { and, eq, isNull } from "drizzle-orm"
import { Effect, Layer, Option } from "effect"

import {
  ActiveClimbingSession,
  ClimbingSessionRepository,
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
            })
            .onConflictDoNothing()
            .returning()
            .pipe(Effect.orDie)

          return Option.fromNullishOr(created).pipe(Option.map(toActiveSession))
        }
      ),
    }
  })
)
