import { describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit } from "effect"
import { TestClock } from "effect/testing"

import { Auth } from "@workspace/auth"
import { GymUserRegistration } from "../src/application/gym-user-registration/gym-user-registration-input-boundary"
import { GymUserRegistrationRepository } from "../src/ports/repositories/gym-user-registration-repository"
import { AuthEmailDelivery } from "../src/ports/services/auth-email-delivery"
import { AuthApplicationTestLayer, AuthTestLayer } from "../src/layers/test-layer"

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

describe("GymUserRegistration.reserveEmail", () => {
  it.effect(
    "signs up an unverified gym-side user with password credentials and sends a verification token",
    () =>
      Effect.gen(function* () {
        const registration = yield* GymUserRegistration
        const repository = yield* GymUserRegistrationRepository
        const emails = yield* AuthEmailDelivery

        const signup = yield* registration.signUp({
          email: "alex@example.com",
          password: "correct horse battery staple",
          displayName: "Alex",
        })

        expect(signup.user.id).toBe("gym-user-1")
        expect(signup.user.email).toBe("alex@example.com")
        expect(signup.user.displayName).toBe("Alex")
        expect(signup.user.emailVerified).toBe(false)

        const credential = yield* repository.findCredentialByUserId(
          signup.user.id
        )
        expect(credential._tag).toBe("Some")
        if (credential._tag === "Some") {
          expect(credential.value.passwordHash).toBe(
            "hashed:correct horse battery staple"
          )
        }

        const sentEmails = yield* emails.sentEmailVerificationTokens
        expect(sentEmails).toEqual([
          {
            email: "alex@example.com",
            token: "gym-user-email-verification-token-1",
          },
        ])
      }).pipe(Effect.provide(AuthApplicationTestLayer))
  )

  it.effect("verifies a gym-side user with the delivered email token", () =>
    Effect.gen(function* () {
      const registration = yield* GymUserRegistration
      const repository = yield* GymUserRegistrationRepository

      const signup = yield* registration.signUp({
        email: "alex@example.com",
        password: "correct horse battery staple",
        displayName: "Alex",
      })

      const verification = yield* registration.verifyEmail({
        token: "gym-user-email-verification-token-1",
      })

      expect(verification.user.id).toBe(signup.user.id)
      expect(verification.user.emailVerified).toBe(true)

      const storedUser = yield* repository.findByEmail("alex@example.com")
      expect(storedUser._tag).toBe("Some")
      if (storedUser._tag === "Some") {
        expect(storedUser.value.emailVerified).toBe(true)
      }
    }).pipe(Effect.provide(AuthApplicationTestLayer))
  )

  it.effect("rejects invalid and replayed email verification tokens", () =>
    Effect.gen(function* () {
      const registration = yield* GymUserRegistration

      const missingToken = yield* Effect.exit(
        registration.verifyEmail({
          token: "missing-token",
        })
      )
      expectFailureTag(missingToken, "GymUserEmailVerificationInvalid")

      yield* registration.signUp({
        email: "alex@example.com",
        password: "correct horse battery staple",
        displayName: "Alex",
      })
      yield* registration.verifyEmail({
        token: "gym-user-email-verification-token-1",
      })

      const replay = yield* Effect.exit(
        registration.verifyEmail({
          token: "gym-user-email-verification-token-1",
        })
      )

      expectFailureTag(replay, "GymUserEmailVerificationInvalid")
    }).pipe(Effect.provide(AuthApplicationTestLayer))
  )

  it.effect("rejects expired email verification tokens", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      yield* auth.signUpGymUser({
        email: "alex@example.com",
        password: "correct horse battery staple",
        displayName: "Alex",
      })
      yield* TestClock.adjust("24 hours")

      const verification = yield* Effect.exit(
        auth.verifyGymUserEmail({
          token: "gym-user-email-verification-token-1",
        })
      )

      expectFailureTag(verification, "GymUserEmailVerificationInvalid")
    }).pipe(Effect.provide(AuthTestLayer))
  )

  it.effect("rejects duplicate gym-side signup emails", () =>
    Effect.gen(function* () {
      const registration = yield* GymUserRegistration

      yield* registration.signUp({
        email: "alex@example.com",
        password: "correct horse battery staple",
        displayName: "Alex",
      })

      const duplicate = yield* Effect.exit(
        registration.signUp({
          email: "alex@example.com",
          password: "different password",
          displayName: "Alex Again",
        })
      )

      expectFailureTag(duplicate, "GymUserEmailAlreadyReserved")
    }).pipe(Effect.provide(AuthApplicationTestLayer))
  )

  it.effect("normalizes gym-side signup email identity for lookup and duplicates", () =>
    Effect.gen(function* () {
      const registration = yield* GymUserRegistration
      const repository = yield* GymUserRegistrationRepository

      const signup = yield* registration.signUp({
        email: " Alex.Member@Example.COM ",
        password: "correct horse battery staple",
        displayName: "Alex",
      })

      expect(signup.user.email).toBe("alex.member@example.com")
      const stored = yield* repository.findByEmail("ALEX.MEMBER@example.com")
      expect(stored._tag).toBe("Some")

      const duplicate = yield* Effect.exit(
        registration.signUp({
          email: "alex.member@EXAMPLE.com",
          password: "different password",
          displayName: "Alex Again",
        })
      )

      expectFailureTag(duplicate, "GymUserEmailAlreadyReserved")
    }).pipe(Effect.provide(AuthApplicationTestLayer))
  )

  it.effect(
    "allows the same email once in the admin namespace and once in the gym-side namespace",
    () =>
      Effect.gen(function* () {
        const auth = yield* Auth

        const admin = yield* auth.bootstrapFirstSystemAdmin({
          email: "alex@example.com",
          password: "admin password",
        })
        const gymUser = yield* auth.signUpGymUser({
          email: "alex@example.com",
          password: "gym password",
          displayName: "Alex",
        })

        expect(admin._tag).toBe("FirstSystemAdminCreated")
        expect(gymUser.user.email).toBe("alex@example.com")
      }).pipe(Effect.provide(AuthTestLayer))
  )

  it.effect(
    "reserves a gym-side email once and rejects a duplicate with a typed error",
    () =>
      Effect.gen(function* () {
        const registration = yield* GymUserRegistration

        const firstReservation = yield* registration.reserveEmail({
          email: "alex@example.com",
          displayName: "Alex",
        })

        expect(firstReservation.email).toBe("alex@example.com")
        expect(firstReservation.displayName).toBe("Alex")

        const duplicate = yield* Effect.exit(
          registration.reserveEmail({
            email: "alex@example.com",
            displayName: "Alex Again",
          })
        )

        expect(Exit.isFailure(duplicate)).toBe(true)
        if (Exit.isFailure(duplicate)) {
          const failure = duplicate.cause.reasons.find(Cause.isFailReason)
          expect(failure).toBeDefined()
          if (failure !== undefined) {
            expect(failure.error._tag).toBe("GymUserEmailAlreadyReserved")
            expect(failure.error.email).toBe("alex@example.com")
          }
        }
      }).pipe(Effect.provide(AuthApplicationTestLayer))
  )
})
