import { Effect, Layer, Option } from "effect"
import { eq } from "drizzle-orm"
import {
  PersistedSession,
  type SessionId,
  SessionRepository,
} from "@auth/application"

import { AuthDB } from "../db/context"
import { sessionsTable } from "../schemas/session.schema"

export const SessionDBRepository = Layer.effect(
  SessionRepository,
  Effect.gen(function* () {
    const db = yield* AuthDB

    return {
      create: Effect.fn("SessionRepository.create")(function* (
        session: PersistedSession
      ) {
        yield* db
          .insert(sessionsTable)
          .values({
            id: session.id,
            userId: session.userId,
            secretHash: session.secretHash,
            lastVerifiedAt: session.lastVerifiedAt,
            createdAt: session.createdAt,
          })
          .pipe(Effect.orDie)

        return session
      }),

      update: Effect.fn("SessionRepository.update")(function* (
        session: PersistedSession
      ) {
        yield* db
          .update(sessionsTable)
          .set({
            userId: session.userId,
            secretHash: session.secretHash,
            lastVerifiedAt: session.lastVerifiedAt,
            createdAt: session.createdAt,
          })
          .where(eq(sessionsTable.id, session.id))
          .pipe(Effect.orDie)

        return session
      }),

      findById: Effect.fn("SessionRepository.findById")(function* (
        sessionId: SessionId
      ) {
        const [session] = yield* db
          .select()
          .from(sessionsTable)
          .where(eq(sessionsTable.id, sessionId))
          .limit(1)
          .pipe(Effect.orDie)

        return Option.fromNullishOr(session).pipe(
          Option.map((session) => PersistedSession.make(session))
        )
      }),

      delete: Effect.fn("SessionRepository.delete")(function* (
        sessionId: SessionId
      ) {
        yield* db
          .delete(sessionsTable)
          .where(eq(sessionsTable.id, sessionId))
          .pipe(Effect.orDie)

        return sessionId
      }),
    }
  })
)
