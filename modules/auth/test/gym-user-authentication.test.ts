import { describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit } from "effect"

import { Auth } from "@workspace/auth"
import { GymUserSessionId } from "../src/domain/gym-user"
import { AuthTestLayer } from "../src/layers/test-layer"

const expectFailureTag = <Tag extends string>(
  exit: Exit.Exit<unknown, { readonly _tag: string }>,
  tag: Tag
) => {
  expect(Exit.isFailure(exit)).toBe(true)
  if (Exit.isFailure(exit)) {
    const failure = exit.cause.reasons.find(Cause.isFailReason)
    expect(failure).toBeDefined()
    if (failure !== undefined) {
      expect(failure.error._tag).toBe(tag)
    }
  }
}

describe("Auth gym user authentication", () => {
  it.effect("logs in a verified gym user, resolves the current session, and logs out", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      const signup = yield* auth.signUpGymUser({
        email: "alex@example.com",
        password: "correct horse battery staple",
        displayName: "Alex",
      })

      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-1",
      })

      const login = yield* auth.loginGymUser({
        email: "alex@example.com",
        password: "correct horse battery staple",
      })

      expect(login.sessionToken).toBe("gym-user-session-token-1")
      expect(login.session.id).toBe("gym-user-session-1")
      expect(login.sessionToken).not.toBe(login.session.id)
      expect(login.session.tokenDigest).toBe(`digest:${login.sessionToken}`)
      expect(login.session.userId).toBe(signup.user.id)
      expect(login.user.email).toBe("alex@example.com")
      expect(login.user.emailVerified).toBe(true)

      const current = yield* auth.currentGymUserSession({
        sessionId: login.sessionToken,
      })

      expect(current.user.id).toBe(login.user.id)
      expect(current.session.id).toBe(login.session.id)

      yield* auth.logoutGymUser({ sessionId: login.sessionToken })

      const afterLogout = yield* Effect.exit(
        auth.currentGymUserSession({ sessionId: login.sessionToken })
      )

      expectFailureTag(afterLogout, "GymUserSessionInvalid")
    }).pipe(Effect.provide(AuthTestLayer))
  )

  it.effect("denies login with invalid gym-side credentials", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      yield* auth.signUpGymUser({
        email: "alex@example.com",
        password: "correct horse battery staple",
        displayName: "Alex",
      })
      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-1",
      })

      const failedLogin = yield* Effect.exit(
        auth.loginGymUser({
          email: "alex@example.com",
          password: "wrong password",
        })
      )

      expectFailureTag(failedLogin, "GymUserInvalidCredentials")
    }).pipe(Effect.provide(AuthTestLayer))
  )

  it.effect("logs in with normalized gym-side email identity", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      yield* auth.signUpGymUser({
        email: "alex@example.com",
        password: "correct horse battery staple",
        displayName: "Alex",
      })
      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-1",
      })

      const login = yield* auth.loginGymUser({
        email: " ALEX@EXAMPLE.COM ",
        password: "correct horse battery staple",
      })

      expect(login.user.email).toBe("alex@example.com")
    }).pipe(Effect.provide(AuthTestLayer))
  )

  it.effect("denies authenticated access for unverified gym-side users", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      yield* auth.signUpGymUser({
        email: "alex@example.com",
        password: "correct horse battery staple",
        displayName: "Alex",
      })

      const login = yield* Effect.exit(
        auth.loginGymUser({
          email: "alex@example.com",
          password: "correct horse battery staple",
        })
      )

      expectFailureTag(login, "GymUserUnverified")
    }).pipe(Effect.provide(AuthTestLayer))
  )

  it.effect("denies unknown gym-side sessions", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      const current = yield* Effect.exit(
        auth.currentGymUserSession({
          sessionId: GymUserSessionId.make("missing-session"),
        })
      )

      expectFailureTag(current, "GymUserSessionInvalid")

      const logout = yield* Effect.exit(
        auth.logoutGymUser({
          sessionId: GymUserSessionId.make("missing-session"),
        })
      )

      expectFailureTag(logout, "GymUserSessionInvalid")
    }).pipe(Effect.provide(AuthTestLayer))
  )
})
