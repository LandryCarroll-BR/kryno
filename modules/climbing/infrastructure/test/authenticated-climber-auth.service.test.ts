import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, Option } from "effect"
import { Auth } from "@auth/component"
import {
  CurrentUser,
  UserId,
} from "@auth/application"
import { AuthenticatedClimber } from "@climbing/application"

import { AuthenticatedClimberAuth } from "../src/services/authenticated-climber-auth.service"

const currentUser = new CurrentUser({
  id: UserId.make("auth-user-1"),
  username: "climber",
  email: "climber@example.com",
  createdAt: new Date("2026-06-23T12:00:00.000Z"),
  role: "user",
})

const AuthTestLayer = Layer.succeed(Auth, {
  signUp: () => Effect.die("unused"),
  signIn: () => Effect.die("unused"),
  signOut: () => Effect.die("unused"),
  validateSession: () => Effect.die("unused"),
  getCurrentUser: ({ token }) =>
    String(token) === "valid.session"
      ? Effect.succeed(Option.some(currentUser))
      : Effect.succeed(Option.none()),
})

const TestLayer = AuthenticatedClimberAuth.pipe(
  Layer.provide(AuthTestLayer)
)

describe("AuthenticatedClimberAuth", () => {
  it.effect("maps the authenticated auth user id to a climber id", () =>
    Effect.gen(function* () {
      const authenticatedClimber = yield* AuthenticatedClimber
      const climberId = yield* authenticatedClimber.resolve("valid.session")

      expect(climberId).toBe("auth-user-1")
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect("normalizes invalid auth sessions", () =>
    Effect.gen(function* () {
      const authenticatedClimber = yield* AuthenticatedClimber
      const error = yield* Effect.flip(
        authenticatedClimber.resolve("invalid.session")
      )

      expect(error._tag).toBe("UnauthenticatedClimberError")
    }).pipe(Effect.provide(TestLayer))
  )
})
