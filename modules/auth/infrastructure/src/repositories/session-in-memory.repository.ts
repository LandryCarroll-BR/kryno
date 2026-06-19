import { Session, SessionId, SessionRepository } from "@auth/application"
import { Effect, Layer, Option, Ref } from "effect"

export const SessionInMemoryRepository = Layer.effect(
  SessionRepository,
  Effect.gen(function* () {
    const store = yield* Ref.make(new Map<string, Session>())

    return {
      create: Effect.fn("SessionInMemoryRepository.create")(function* (
        session: Session
      ) {
        return yield* Ref.modify(store, (current) => {
          const next = new Map(current)
          next.set(session.id, session)

          return [session, next]
        })
      }),

      update: Effect.fn("SessionInMemoryRepository.update")(function* (
        session: Session
      ) {
        return yield* Ref.modify(store, (current) => {
          const next = new Map(current)
          next.set(session.id, session)

          return [session, next]
        })
      }),

      findById: Effect.fn("SessionInMemoryRepository.findById")(function* (
        sessionId: SessionId
      ) {
        const current = yield* Ref.get(store)
        return Option.fromNullishOr(current.get(sessionId))
      }),

      delete: Effect.fn("SessionInMemoryRepository.delete")(function* (
        sessionId: SessionId
      ) {
        return yield* Ref.modify(store, (current) => {
          const next = new Map(current)
          next.delete(sessionId)

          return [sessionId, next]
        })
      }),
    }
  })
)
