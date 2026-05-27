import { Effect, Layer } from "effect"
import * as Context from "effect/Context"

import {
  GymUserRegistrationRecord,
  type ReserveGymUserEmailInput,
  type GymUserEmailAlreadyReserved,
} from "../domain/index.ts"
import { ensureGymUserEmailCanBeReserved } from "../policies/index.ts"
import { AuthIdGenerator } from "./auth-id-generator.ts"
import { GymUserRegistrationRepository } from "./gym-user-registration-repository.ts"

export class GymUserRegistration extends Context.Tag(
  "@kryno/auth/GymUserRegistration"
)<
  GymUserRegistration,
  {
    readonly reserveEmail: (
      input: ReserveGymUserEmailInput
    ) => Effect.Effect<GymUserRegistrationRecord, GymUserEmailAlreadyReserved>
  }
>() {}

export const GymUserRegistrationLayer = Layer.effect(
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
