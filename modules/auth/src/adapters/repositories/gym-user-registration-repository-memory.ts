import { Effect, Layer, Option } from "effect"

import type { GymUserRegistrationRecord } from "../../domain/gym-user.ts"
import { GymUserRegistrationRepository } from "../../ports/repositories/gym-user-registration-repository.ts"

export const GymUserRegistrationRepositoryMemoryAdapter = Layer.sync(
  GymUserRegistrationRepository,
  () => {
    const recordsByEmail = new Map<string, GymUserRegistrationRecord>()

    return {
      findByEmail: (email: string) =>
        Effect.sync(() => Option.fromNullishOr(recordsByEmail.get(email))),
      save: (record: GymUserRegistrationRecord) =>
        Effect.sync(() => {
          recordsByEmail.set(record.email, record)
        }),
    }
  }
)
