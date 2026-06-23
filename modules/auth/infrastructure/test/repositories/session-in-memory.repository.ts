import { PersistedSession, SessionRepository } from "@auth/application"
import { Effect, Layer, Option, Ref } from "effect"

export const SessionInMemoryRepository = Layer.effect(
  SessionRepository,
  Effect.gen(function* () {
    const store = yield* Ref.make(new Map<string, PersistedSession>())

    return {
      create: Effect.fn("SessionRepository.create")(
        function* (session) {
          return yield* Ref.modify(store, (current) => {
            const next = new Map(current)
            next.set(session.id, session)

            return [session, next]
          })
        }
      ),

      update: Effect.fn("SessionRepository.update")(
        function* (session) {
          return yield* Ref.modify(store, (current) => {
            const next = new Map(current)
            next.set(session.id, session)

            return [session, next]
          })
        }
      ),

      findById: Effect.fn("SessionRepository.findById")(
        function* (sessionId) {
          const current = yield* Ref.get(store)
          return Option.fromNullishOr(current.get(sessionId))
        }
      ),

      delete: Effect.fn("SessionRepository.delete")(
        function* (sessionId) {
          return yield* Ref.modify(store, (current) => {
            const next = new Map(current)
            next.delete(sessionId)

            return [sessionId, next]
          })
        }
      ),
    }
  })
)
