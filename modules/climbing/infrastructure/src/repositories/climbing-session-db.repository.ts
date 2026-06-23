import { and, eq, isNull } from "drizzle-orm"
import { Effect, Layer, Option } from "effect"
import {
  ActiveClimbingSession,
  ClimbingSessionRepository,
  type ClimberId,
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

    const findActiveByClimberId = Effect.fn(
      "ClimbingSessionRepository.findActiveByClimberId"
    )(function* (climberId: ClimberId) {
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
    })

    return {
      findActiveByClimberId,
      createActive: Effect.fn("ClimbingSessionRepository.createActive")(
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

          if (created !== undefined) {
            return toActiveSession(created)
          }

          const existing = yield* findActiveByClimberId(session.climberId)
          return yield* Option.match(existing, {
            onNone: () =>
              Effect.die(
                new Error(
                  "Active climbing session conflict occurred without an existing session."
                )
              ),
            onSome: Effect.succeed,
          })
        }
      ),
    }
  })
)
