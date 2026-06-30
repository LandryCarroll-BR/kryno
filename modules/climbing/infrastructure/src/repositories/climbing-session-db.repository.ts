import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm"
import { Effect, Layer, Option, Schema } from "effect"

import {
  AttemptOrdinal,
  ClimbingAttempt,
} from "@climbing/application/models/climbing-attempt"
import {
  ActiveClimbingSession,
  type ClimbingSessionId,
  CompletedClimbingSession,
} from "@climbing/application/models/climbing-session"
import { ClimbingSessionRepository } from "@climbing/application/repositories/climbing-session"

import { ClimbingDB } from "../db/context"
import { climbingAttemptsTable } from "../schemas/climbing-attempt.schema"
import { climbingSessionsTable } from "../schemas/climbing-session.schema"

const toAttempt = (
  row: typeof climbingAttemptsTable.$inferSelect
): ClimbingAttempt =>
  Schema.decodeUnknownSync(ClimbingAttempt)({
    id: row.id,
    boulderId: row.boulderId,
    ordinal: row.ordinal,
    outcome: row.outcome,
    occurredAt: row.occurredAt,
  })

const toActiveSession = (
  row: typeof climbingSessionsTable.$inferSelect,
  attempts: readonly ClimbingAttempt[]
): ActiveClimbingSession =>
  ActiveClimbingSession.make({
    id: row.id,
    climberId: row.climberId,
    attempts,
    startedAt: row.startedAt,
  })

const toCompletedSession = (
  row: typeof climbingSessionsTable.$inferSelect & { endedAt: Date },
  attempts: readonly ClimbingAttempt[]
): CompletedClimbingSession =>
  CompletedClimbingSession.make({
    id: row.id,
    climberId: row.climberId,
    attempts,
    startedAt: row.startedAt,
    endedAt: row.endedAt,
  })

export const ClimbingSessionDBRepository = Layer.effect(
  ClimbingSessionRepository,
  Effect.gen(function* () {
    const db = yield* ClimbingDB

    const findAttemptsBySessionId = Effect.fn(
      "ClimbingSessionRepository.findAttemptsBySessionId"
    )(function* (sessionId: ClimbingSessionId) {
      const attempts = yield* db
        .select()
        .from(climbingAttemptsTable)
        .where(eq(climbingAttemptsTable.sessionId, sessionId))
        .orderBy(asc(climbingAttemptsTable.occurredAt))
        .pipe(Effect.orDie)

      return attempts.map(toAttempt)
    })

    return {
      findAllByClimberId: Effect.fn(
        "ClimbingSessionRepository.findAllByClimberId"
      )(function* (climberId) {
        const sessions = yield* db
          .select()
          .from(climbingSessionsTable)
          .where(eq(climbingSessionsTable.climberId, climberId))
          .orderBy(asc(climbingSessionsTable.startedAt))
          .pipe(Effect.orDie)

        if (sessions.length === 0) {
          return []
        }

        const attempts = yield* db
          .select()
          .from(climbingAttemptsTable)
          .where(
            inArray(
              climbingAttemptsTable.sessionId,
              sessions.map((session) => session.id)
            )
          )
          .orderBy(
            asc(climbingAttemptsTable.occurredAt),
            asc(climbingAttemptsTable.ordinal)
          )
          .pipe(Effect.orDie)

        const attemptsBySessionId = new Map<
          ClimbingSessionId,
          ClimbingAttempt[]
        >()

        for (const attempt of attempts) {
          const sessionAttempts =
            attemptsBySessionId.get(attempt.sessionId) ?? []
          sessionAttempts.push(toAttempt(attempt))
          attemptsBySessionId.set(attempt.sessionId, sessionAttempts)
        }

        return sessions.map((session) => {
          const sessionAttempts = attemptsBySessionId.get(session.id) ?? []

          return session.endedAt === null
            ? toActiveSession(session, sessionAttempts)
            : toCompletedSession(
                { ...session, endedAt: session.endedAt },
                sessionAttempts
              )
        })
      }),

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

        if (session === undefined) {
          return Option.none()
        }

        const attempts = yield* findAttemptsBySessionId(session.id)

        return Option.some(toActiveSession(session, attempts))
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

          return Option.fromNullishOr(created).pipe(
            Option.map((row) => toActiveSession(row, []))
          )
        }
      ),

      insertAttemptIntoActiveSession: Effect.fn(
        "ClimbingSessionRepository.insertAttemptIntoActiveSession"
      )(function* ({ climberId, id, boulderId, outcome, occurredAt }) {
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

        if (session === undefined) {
          return Option.none()
        }

        const [latestAttempt] = yield* db
          .select()
          .from(climbingAttemptsTable)
          .where(
            and(
              eq(climbingAttemptsTable.sessionId, session.id),
              eq(climbingAttemptsTable.boulderId, boulderId)
            )
          )
          .orderBy(desc(climbingAttemptsTable.ordinal))
          .limit(1)
          .pipe(Effect.orDie)

        const ordinal = AttemptOrdinal.make((latestAttempt?.ordinal ?? 0) + 1)

        const [created] = yield* db
          .insert(climbingAttemptsTable)
          .values({
            id,
            sessionId: session.id,
            boulderId,
            ordinal,
            outcome,
            occurredAt,
            createdAt: occurredAt,
          })
          .returning()
          .pipe(Effect.orDie)

        if (created === undefined) {
          return yield* Effect.die(
            new Error("Climbing attempt insertion returned no created row.")
          )
        }

        return Option.some(toAttempt(created))
      }),

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

        const attempts = yield* findAttemptsBySessionId(ended.id)

        return Option.some(
          toCompletedSession({ ...ended, endedAt: ended.endedAt }, attempts)
        )
      }),
    }
  })
)
