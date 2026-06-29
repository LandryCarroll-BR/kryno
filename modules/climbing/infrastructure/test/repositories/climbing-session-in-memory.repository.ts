import {
  AttemptOrdinal,
  ClimbingAttempt,
} from "@climbing/application/models/climbing-attempt"
import {
  type ActiveClimbingSession,
  CompletedClimbingSession,
} from "@climbing/application/models/climbing-session"
import { ClimbingSessionRepository } from "@climbing/application/repositories/climbing-session"
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

      insertAttemptIntoActiveSession: Effect.fn(
        "ClimbingSessionRepository.insertAttemptIntoActiveSession"
      )(function* ({ climberId, id, boulderId, outcome, occurredAt }) {
        return yield* Ref.modify(store, (sessions) => {
          const activeSession = sessions.get(climberId)
          if (activeSession === undefined) {
            return [Option.none(), sessions]
          }

          const ordinal = AttemptOrdinal.make(
            activeSession.attempts.filter(
              (attempt) => attempt.boulderId === boulderId
            ).length + 1
          )
          const attempt = ClimbingAttempt.make({
            id,
            boulderId,
            ordinal,
            outcome,
            occurredAt,
          })
          const updatedSession: ActiveClimbingSession = {
            ...activeSession,
            attempts: [...activeSession.attempts, attempt],
          }
          const next = new Map(sessions)
          next.set(climberId, updatedSession)

          return [Option.some(attempt), next]
        })
      }),

      endActiveByClimberId: Effect.fn(
        "ClimbingSessionRepository.endActiveByClimberId"
      )(function* (climberId, endedAt) {
        return yield* Ref.modify(store, (sessions) => {
          const activeSession = sessions.get(climberId)
          if (activeSession === undefined) {
            return [Option.none(), sessions]
          }

          const next = new Map(sessions)
          next.delete(climberId)

          return [
            Option.some(
              CompletedClimbingSession.make({
                id: activeSession.id,
                climberId: activeSession.climberId,
                attempts: activeSession.attempts,
                startedAt: activeSession.startedAt,
                endedAt,
              })
            ),
            next,
          ]
        })
      }),
    }
  })
)
