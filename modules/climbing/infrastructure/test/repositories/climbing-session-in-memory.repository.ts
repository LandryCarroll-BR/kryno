import {
  ClimbingSessionRepository,
  type ActiveClimbingSession,
} from "@climbing/application"
import { Effect, Layer, Option, Ref } from "effect"

export const ClimbingSessionInMemoryRepository = Layer.effect(
  ClimbingSessionRepository,
  Effect.gen(function* () {
    const store = yield* Ref.make(new Map<string, ActiveClimbingSession>())

    return {
      findActiveByClimberId: Effect.fn(
        "ClimbingSessionRepository.findActiveByClimberId"
      )(function* (climberId) {
        const sessions = yield* Ref.get(store)
        return Option.fromNullishOr(sessions.get(climberId))
      }),

      insertActive: Effect.fn("ClimbingSessionRepository.insertActive")(
        function* (session) {
          return yield* Ref.modify(store, (sessions) => {
            const existing = sessions.get(session.climberId)
            if (existing !== undefined) {
              return [Option.none(), sessions]
            }

            const next = new Map(sessions)
            next.set(session.climberId, session)
            return [Option.some(session), next]
          })
        }
      ),
    }
  })
)
