import { describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit } from "effect"

import { GymUserRegistration } from "../src/application/gym-user-registration/gym-user-registration-input-boundary"
import { AuthTestLayer } from "../src/layers/test-layer"

describe("GymUserRegistration.reserveEmail", () => {
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
            expect(failure.error._tag).toBe(
              "GymUserEmailAlreadyReserved"
            )
            expect(failure.error.email).toBe("alex@example.com")
          }
        }
      }).pipe(Effect.provide(AuthTestLayer))
  )
})
