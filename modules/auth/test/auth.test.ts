import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, Option } from "effect"
import { PersistenceError } from "@workspace/drizzle"

import { Auth } from "@workspace/auth"
import { GymUserRegistration } from "../src/application/gym-user-registration/gym-user-registration-input-boundary"
import { GymUserRegistrationInteractor } from "../src/application/gym-user-registration/gym-user-registration-interactor"
import { GymUserRegistrationRepository } from "../src/ports/repositories/gym-user-registration-repository"
import { AuthEmailDeliveryMemoryAdapter } from "../src/adapters/services/auth-email-delivery-memory"
import { AuthIdGeneratorSequentialAdapter } from "../src/adapters/services/auth-id-generator-sequential"
import { AuthTokenGeneratorSequentialAdapter } from "../src/adapters/services/auth-token-generator-sequential"
import { PasswordHasherDeterministicAdapter } from "../src/adapters/services/password-hasher-deterministic"
import { AuthTestLayer } from "../src/layers/test-layer"
import { AuthMock } from "../src/layers/mock-layer"

describe("Auth", () => {
  it.effect("can be provided by the live application test layer", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      const reservation = yield* auth.reserveGymUserEmail({
        email: "alex@example.com",
        displayName: "Alex",
      })

      expect(reservation.id).toBe("gym-user-1")
      expect(reservation.email).toBe("alex@example.com")
    }).pipe(Effect.provide(AuthTestLayer))
  )

  it.effect("can be provided by a mock layer", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      const reservation = yield* auth.reserveGymUserEmail({
        email: "mock@example.com",
        displayName: "Mock User",
      })

      expect(reservation.id).toBe("gym-user-mock")
      expect(reservation.email).toBe("mock@example.com")
    }).pipe(Effect.provide(AuthMock))
  )

  it.effect("keeps repository persistence failures visible inside the module", () =>
    Effect.gen(function* () {
      const registration = yield* GymUserRegistration
      const error = yield* registration
        .reserveEmail({
          email: "alex@example.com",
          displayName: "Alex",
        })
        .pipe(Effect.flip)

      expect(error).toBeInstanceOf(PersistenceError)
      expect(error._tag).toBe("PersistenceError")
      if (error._tag === "PersistenceError") {
        expect(error.operation).toBe("auth.gymUserRegistration.findByEmail")
      }
    }).pipe(Effect.provide(GymUserRegistrationWithFailingRepositoryLayer))
  )
})

const repositoryFailure = new PersistenceError({
  operation: "auth.gymUserRegistration.findByEmail",
  error: new Error("database unavailable"),
})

const FailingGymUserRegistrationRepository = Layer.succeed(
  GymUserRegistrationRepository,
  {
    findById: () => Effect.succeed(Option.none()),
    findByEmail: () => Effect.fail(repositoryFailure),
    findCredentialByUserId: () => Effect.succeed(Option.none()),
    findSessionByTokenDigest: () => Effect.succeed(Option.none()),
    save: () => Effect.void,
    saveCredential: () => Effect.void,
    saveEmailVerificationToken: () => Effect.void,
    findEmailVerificationToken: () => Effect.succeed(Option.none()),
    savePasswordResetToken: () => Effect.void,
    findPasswordResetToken: () => Effect.succeed(Option.none()),
    saveSession: () => Effect.void,
    invalidateSession: () => Effect.void,
  }
)

const GymUserRegistrationWithFailingRepositoryLayer =
  GymUserRegistrationInteractor.pipe(
    Layer.provideMerge(FailingGymUserRegistrationRepository),
    Layer.provideMerge(AuthEmailDeliveryMemoryAdapter),
    Layer.provideMerge(AuthIdGeneratorSequentialAdapter),
    Layer.provideMerge(AuthTokenGeneratorSequentialAdapter),
    Layer.provideMerge(PasswordHasherDeterministicAdapter)
  )
