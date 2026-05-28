import { Effect, Layer } from "effect"

import {
  GymUserRegistrationRecord,
  type ReserveGymUserEmailInput,
} from "../../domain/gym-user.ts"
import { GymUserRegistrationRepository } from "../../ports/repositories/gym-user-registration-repository.ts"
import { AuthIdGenerator } from "../../ports/services/auth-id-generator.ts"
import { GymUserRegistration } from "./gym-user-registration-input-boundary.ts"
import { ensureGymUserEmailCanBeReserved } from "./gym-user-registration-policy.ts"

export const GymUserRegistrationInteractor = Layer.effect(
  GymUserRegistration,
  Effect.gen(function* () {
    const ids = yield* AuthIdGenerator
    const repository = yield* GymUserRegistrationRepository

    const reserveEmail = Effect.fn("GymUserRegistration.reserveEmail")(
      (command: ReserveGymUserEmailInput) =>
        Effect.gen(function* () {
          const existing = yield* repository.findByEmail(command.email)

          yield* ensureGymUserEmailCanBeReserved(command.email, existing)

          const record = new GymUserRegistrationRecord({
            id: yield* ids.nextGymUserId,
            email: command.email,
            displayName: command.displayName,
          })

          yield* repository.save(record)

          return record
        })
    )

    return { reserveEmail }
  })
)
