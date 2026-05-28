import { describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit, Layer } from "effect"
import { TestClock } from "effect/testing"

import { Auth } from "@workspace/auth"
import { AuthEmailDelivery } from "../src/ports/services/auth-email-delivery"
import { AuthApplicationTestLayer } from "../src/layers/test-layer"

const PasswordResetTestLayer = Auth.layer.pipe(
  Layer.provideMerge(AuthApplicationTestLayer)
)

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

describe("Auth gym user password reset", () => {
  it.effect("requests a reset token for an existing gym-side user", () =>
    Effect.gen(function* () {
      const auth = yield* Auth
      const emailDelivery = yield* AuthEmailDelivery

      yield* auth.signUpGymUser({
        email: "alex@example.com",
        password: "old password",
        displayName: "Alex",
      })

      const request = yield* auth.requestGymUserPasswordReset({
        email: "alex@example.com",
      })

      expect(request.email).toBe("alex@example.com")

      const deliveries = yield* emailDelivery.sentGymUserPasswordResetTokens
      expect(deliveries).toEqual([
        {
          email: "alex@example.com",
          token: "gym-user-password-reset-token-1",
        },
      ])
    }).pipe(Effect.provide(PasswordResetTestLayer))
  )

  it.effect("completes a reset and replaces the password credential", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      yield* auth.signUpGymUser({
        email: "alex@example.com",
        password: "old password",
        displayName: "Alex",
      })
      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-1",
      })
      yield* auth.requestGymUserPasswordReset({ email: "alex@example.com" })

      const reset = yield* auth.completeGymUserPasswordReset({
        token: "gym-user-password-reset-token-1",
        newPassword: "new password",
      })

      expect(reset.user.email).toBe("alex@example.com")

      const oldPasswordLogin = yield* Effect.exit(
        auth.loginGymUser({
          email: "alex@example.com",
          password: "old password",
        })
      )
      expectFailureTag(oldPasswordLogin, "GymUserInvalidCredentials")

      const newPasswordLogin = yield* auth.loginGymUser({
        email: "alex@example.com",
        password: "new password",
      })
      expect(newPasswordLogin.user.email).toBe("alex@example.com")
    }).pipe(Effect.provide(PasswordResetTestLayer))
  )

  it.effect("denies expired reset tokens", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      yield* auth.signUpGymUser({
        email: "alex@example.com",
        password: "old password",
        displayName: "Alex",
      })
      yield* auth.requestGymUserPasswordReset({ email: "alex@example.com" })

      yield* TestClock.adjust("1 hour")

      const reset = yield* Effect.exit(
        auth.completeGymUserPasswordReset({
          token: "gym-user-password-reset-token-1",
          newPassword: "new password",
        })
      )

      expectFailureTag(reset, "GymUserPasswordResetTokenExpired")
    }).pipe(Effect.provide(PasswordResetTestLayer))
  )

  it.effect("denies reset token replay", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      yield* auth.signUpGymUser({
        email: "alex@example.com",
        password: "old password",
        displayName: "Alex",
      })
      yield* auth.requestGymUserPasswordReset({ email: "alex@example.com" })
      yield* auth.completeGymUserPasswordReset({
        token: "gym-user-password-reset-token-1",
        newPassword: "new password",
      })

      const replay = yield* Effect.exit(
        auth.completeGymUserPasswordReset({
          token: "gym-user-password-reset-token-1",
          newPassword: "another password",
        })
      )

      expectFailureTag(replay, "GymUserPasswordResetTokenAlreadyUsed")
    }).pipe(Effect.provide(PasswordResetTestLayer))
  )

  it.effect("denies reset requests for unknown gym-side emails", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      const request = yield* Effect.exit(
        auth.requestGymUserPasswordReset({ email: "missing@example.com" })
      )

      expectFailureTag(request, "GymUserPasswordResetUnknownEmail")
    }).pipe(Effect.provide(PasswordResetTestLayer))
  )
})
