import { describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit } from "effect"
import { TestClock } from "effect/testing"

import { Auth } from "@workspace/auth"
import { SystemAdminSessionId } from "../src/domain/system-admin"
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

describe("Auth system admin authentication", () => {
  it.effect("logs in, resolves the current admin session, and logs out", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      const bootstrap = yield* auth.bootstrapFirstSystemAdmin({
        email: "admin@example.com",
        password: "correct horse battery staple",
      })

      expect(bootstrap._tag).toBe("FirstSystemAdminCreated")

      const login = yield* auth.loginSystemAdmin({
        email: "admin@example.com",
        password: "correct horse battery staple",
      })

      expect(login.sessionToken).toBe("system-admin-session-token-1")
      expect(login.session.id).toBe("system-admin-session-1")
      expect(login.sessionToken).not.toBe(login.session.id)
      expect(login.session.tokenDigest).toBe(`digest:${login.sessionToken}`)
      expect(login.session.adminId).toBe(login.admin.id)
      expect(login.admin.email).toBe("admin@example.com")

      const current = yield* auth.currentSystemAdminSession({
        sessionId: login.sessionToken,
      })

      expect(current.admin.id).toBe(login.admin.id)
      expect(current.session.id).toBe(login.session.id)

      yield* auth.logoutSystemAdmin({ sessionId: login.sessionToken })

      const afterLogout = yield* Effect.exit(
        auth.currentSystemAdminSession({ sessionId: login.sessionToken })
      )

      expectFailureTag(afterLogout, "SystemAdminSessionInvalid")
    }).pipe(Effect.provide(AuthTestLayer))
  )

  it.effect("denies login with invalid credentials", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      yield* auth.bootstrapFirstSystemAdmin({
        email: "admin@example.com",
        password: "correct horse battery staple",
      })

      const failedLogin = yield* Effect.exit(
        auth.loginSystemAdmin({
          email: "admin@example.com",
          password: "wrong password",
        })
      )

      expectFailureTag(failedLogin, "SystemAdminInvalidCredentials")
    }).pipe(Effect.provide(AuthTestLayer))
  )

  it.effect("logs in with normalized system-admin email identity", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      yield* auth.bootstrapFirstSystemAdmin({
        email: " Admin@Example.COM ",
        password: "correct horse battery staple",
      })

      const login = yield* auth.loginSystemAdmin({
        email: "admin@example.com",
        password: "correct horse battery staple",
      })

      expect(login.admin.email).toBe("admin@example.com")
    }).pipe(Effect.provide(AuthTestLayer))
  )

  it.effect("denies unknown admin sessions", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      const current = yield* Effect.exit(
        auth.currentSystemAdminSession({
          sessionId: SystemAdminSessionId.make("missing-session"),
        })
      )

      expectFailureTag(current, "SystemAdminSessionInvalid")

      const logout = yield* Effect.exit(
        auth.logoutSystemAdmin({
          sessionId: SystemAdminSessionId.make("missing-session"),
        })
      )

      expectFailureTag(logout, "SystemAdminSessionInvalid")
    }).pipe(Effect.provide(AuthTestLayer))
  )

  it.effect("expires admin sessions before gym-side sessions", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      yield* auth.bootstrapFirstSystemAdmin({
        email: "admin@example.com",
        password: "correct horse battery staple",
      })
      const adminLogin = yield* auth.loginSystemAdmin({
        email: "admin@example.com",
        password: "correct horse battery staple",
      })

      yield* auth.signUpGymUser({
        email: "alex@example.com",
        password: "correct horse battery staple",
        displayName: "Alex",
      })
      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-1",
      })
      const gymUserLogin = yield* auth.loginGymUser({
        email: "alex@example.com",
        password: "correct horse battery staple",
      })

      yield* TestClock.adjust("12 hours")

      const adminSession = yield* Effect.exit(
        auth.currentSystemAdminSession({
          sessionId: adminLogin.sessionToken,
        })
      )
      const gymUserSession = yield* auth.currentGymUserSession({
        sessionId: gymUserLogin.sessionToken,
      })

      expectFailureTag(adminSession, "SystemAdminSessionInvalid")
      expect(gymUserSession.user.email).toBe("alex@example.com")
    }).pipe(Effect.provide(AuthTestLayer))
  )
})
