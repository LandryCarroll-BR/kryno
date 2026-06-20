import { DB } from "@/db/context"
import { sessionsTable } from "@/schemas/session.schema"
import { Session, type SessionId, SessionRepository } from "@auth/application"
import { eq } from "drizzle-orm"
import { Effect, Layer, Option } from "effect"

export const SessionDBRepository = Layer.effect(
  SessionRepository,
  Effect.gen(function* () {
    const db = yield* DB

    return {
      create: Effect.fn("SessionDBRepository.create")(function* (
        session: Session
      ) {
        yield* db
          .insert(sessionsTable)
          .values({
            id: session.id,
            userId: session.userId,
            role: session.role,
            secretHash: session.secretHash,
            lastVerifiedAt: session.lastVerifiedAt,
            createdAt: session.createdAt,
          })
          .pipe(Effect.orDie)

        return session
      }),

      update: Effect.fn("SessionDBRepository.update")(function* (
        session: Session
      ) {
        yield* db
          .update(sessionsTable)
          .set({
            userId: session.userId,
            role: session.role,
            secretHash: session.secretHash,
            lastVerifiedAt: session.lastVerifiedAt,
            createdAt: session.createdAt,
          })
          .where(eq(sessionsTable.id, session.id))
          .pipe(Effect.orDie)

        return session
      }),

      findById: Effect.fn("SessionDBRepository.findById")(function* (
        sessionId: SessionId
      ) {
        const [session] = yield* db
          .select()
          .from(sessionsTable)
          .where(eq(sessionsTable.id, sessionId))
          .limit(1)
          .pipe(Effect.orDie)

        return Option.fromNullishOr(session).pipe(Option.map(Session.make))
      }),

      delete: Effect.fn("SessionDBRepository.delete")(function* (
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
