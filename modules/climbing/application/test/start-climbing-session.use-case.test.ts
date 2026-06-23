import { describe, expect, it } from "@effect/vitest"
import {
  ApplicationLayer,
  AuthenticatedClimber,
  ClimberId,
  ClimbingSessionId,
  ClimbingSessionIdService,
  ClimbingSessionRepository,
  CompletedClimbingSession,
  EndClimbingSessionUseCase,
  NoActiveClimbingSessionError,
  type ActiveClimbingSession,
  StartClimbingSessionUseCase,
  UnauthenticatedClimberError,
} from "@climbing/application"
import { Effect, Layer, Option, Ref } from "effect"

const TestInfrastructureLayer = Layer.mergeAll(
  Layer.succeed(AuthenticatedClimber, {
    resolve: (token) =>
      token === "valid-token"
        ? Effect.succeed(ClimberId.make("climber-1"))
        : Effect.fail(new UnauthenticatedClimberError()),
  }),
  Layer.succeed(ClimbingSessionIdService, {
    generate: () =>
      Effect.succeed(ClimbingSessionId.make("climbing-session-1")),
  }),
  Layer.effect(
    ClimbingSessionRepository,
    Effect.gen(function* () {
      const store = yield* Ref.make(
        new Map<string, ActiveClimbingSession>()
      )

      return {
        findActiveByClimberId: (climberId: ClimberId) =>
          Ref.get(store).pipe(
            Effect.map((sessions) =>
              Option.fromNullishOr(sessions.get(climberId))
            )
          ),
        insertActive: (session: ActiveClimbingSession) =>
          Ref.modify(store, (sessions) => {
            const existing = sessions.get(session.climberId)
            if (existing !== undefined) {
              return [Option.none(), sessions]
            }
            const next = new Map(sessions)
            next.set(session.climberId, session)
            return [Option.some(session), next]
          }),
        endActiveByClimberId: (climberId: ClimberId, endedAt: Date) =>
          Ref.modify(store, (sessions) => {
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
          }),
      }
    })
  )
)

const TestLayer = ApplicationLayer.pipe(
  Layer.provide(TestInfrastructureLayer)
)

describe("StartClimbingSessionUseCase", () => {
  it.effect("starts a session for the authenticated climber", () =>
    Effect.gen(function* () {
      const useCase = yield* StartClimbingSessionUseCase
      const session = yield* useCase.execute({ token: "valid-token" })

      expect(session.climberId).toBe("climber-1")
      expect(session.id).toBe("climbing-session-1")
      expect(session.attempts).toEqual([])
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect("returns the existing active session", () =>
    Effect.gen(function* () {
      const useCase = yield* StartClimbingSessionUseCase
      const first = yield* useCase.execute({ token: "valid-token" })
      const second = yield* useCase.execute({ token: "valid-token" })

      expect(second).toEqual(first)
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect("fails when the climber is not authenticated", () =>
    Effect.gen(function* () {
      const useCase = yield* StartClimbingSessionUseCase
      const error = yield* Effect.flip(
        useCase.execute({ token: "invalid-token" })
      )

      expect(error._tag).toBe("UnauthenticatedClimberError")
    }).pipe(Effect.provide(TestLayer))
  )
})

describe("EndClimbingSessionUseCase", () => {
  it.effect("ends the active session for the authenticated climber", () =>
    Effect.gen(function* () {
      const startUseCase = yield* StartClimbingSessionUseCase
      const endUseCase = yield* EndClimbingSessionUseCase

      const activeSession = yield* startUseCase.execute({
        token: "valid-token",
      })
      const completedSession = yield* endUseCase.execute({
        token: "valid-token",
      })

      expect(completedSession.id).toBe(activeSession.id)
      expect(completedSession.climberId).toBe("climber-1")
      expect(completedSession.endedAt).toBeInstanceOf(Date)
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect("fails when there is no active climbing session", () =>
    Effect.gen(function* () {
      const useCase = yield* EndClimbingSessionUseCase
      const error = yield* Effect.flip(
        useCase.execute({ token: "valid-token" })
      )

      expect(error).toBeInstanceOf(NoActiveClimbingSessionError)
      expect(error._tag).toBe("NoActiveClimbingSessionError")
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect("fails when the climber is not authenticated", () =>
    Effect.gen(function* () {
      const useCase = yield* EndClimbingSessionUseCase
      const error = yield* Effect.flip(
        useCase.execute({ token: "invalid-token" })
      )

      expect(error._tag).toBe("UnauthenticatedClimberError")
    }).pipe(Effect.provide(TestLayer))
  )
})
