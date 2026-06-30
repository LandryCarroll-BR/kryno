import {
  AttemptOrdinal,
  ClimbingAttempt,
} from "@climbing/application/models/climbing-attempt"
import {
  type ActiveClimbingSession,
  type ClimbingSession,
  CompletedClimbingSession,
} from "@climbing/application/models/climbing-session"
import { ClimbingSessionRepository } from "@climbing/application/repositories/climbing-session"
import { Effect, Layer, Option, Predicate, Ref } from "effect"

export const ClimbingSessionInMemoryRepository = Layer.effect(
  ClimbingSessionRepository,
  Effect.gen(function* () {
    const store = yield* Ref.make(new Map<string, ClimbingSession>())

    const findActive = (
      sessions: ReadonlyMap<string, ClimbingSession>,
      climberId: ActiveClimbingSession["climberId"]
    ): ActiveClimbingSession | undefined =>
      [...sessions.values()].find(
        (session): session is ActiveClimbingSession =>
          session.climberId === climberId &&
          Predicate.isTagged(session, "ActiveClimbingSession")
      )

    return {
      findAllByClimberId: Effect.fn(
        "ClimbingSessionRepository.findAllByClimberId"
      )(function* (climberId) {
        const sessions = yield* Ref.get(store)

        return [...sessions.values()]
          .filter((session) => session.climberId === climberId)
          .sort(
            (left, right) =>
              left.startedAt.getTime() - right.startedAt.getTime()
          )
      }),

      findActiveByClimberId: Effect.fn(
        "ClimbingSessionRepository.findActiveByClimberId"
      )(function* (climberId) {
        const sessions = yield* Ref.get(store)
        return Option.fromNullishOr(findActive(sessions, climberId))
      }),

      insertActive: Effect.fn("ClimbingSessionRepository.insertActive")(
        function* (session) {
          return yield* Ref.modify(store, (sessions) => {
            if (findActive(sessions, session.climberId) !== undefined) {
              return [Option.none(), sessions]
            }

            const next = new Map(sessions)
            next.set(session.id, session)
            return [Option.some(session), next]
          })
        }
      ),

      insertAttemptIntoActiveSession: Effect.fn(
        "ClimbingSessionRepository.insertAttemptIntoActiveSession"
      )(function* ({ climberId, id, boulderId, outcome, occurredAt }) {
        return yield* Ref.modify(store, (sessions) => {
          const activeSession = findActive(sessions, climberId)
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
          next.set(activeSession.id, updatedSession)

          return [Option.some(attempt), next]
        })
      }),

      endActiveByClimberId: Effect.fn(
        "ClimbingSessionRepository.endActiveByClimberId"
      )(function* (climberId, endedAt) {
        return yield* Ref.modify(store, (sessions) => {
          const activeSession = findActive(sessions, climberId)
          if (activeSession === undefined) {
            return [Option.none(), sessions]
          }

          const completedSession = CompletedClimbingSession.make({
            id: activeSession.id,
            climberId: activeSession.climberId,
            attempts: activeSession.attempts,
            startedAt: activeSession.startedAt,
            endedAt,
          })
          const next = new Map(sessions)
          next.set(activeSession.id, completedSession)

          return [Option.some(completedSession), next]
        })
      }),
    }
  })
)
