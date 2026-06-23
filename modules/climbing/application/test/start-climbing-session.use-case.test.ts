import { describe, expect, it } from "@effect/vitest"
import {
  ApplicationLayer,
  AuthenticatedClimber,
  ClimberId,
  ClimbingSessionId,
  ClimbingSessionIdService,
  ClimbingSessionRepository,
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
        createActive: (session: ActiveClimbingSession) =>
          Ref.modify(store, (sessions) => {
            const existing = sessions.get(session.climberId)
            if (existing !== undefined) {
              return [existing, sessions]
            }
            const next = new Map(sessions)
            next.set(session.climberId, session)
            return [session, next]
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
