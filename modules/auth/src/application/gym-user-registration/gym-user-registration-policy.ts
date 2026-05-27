import { Effect, Option } from "effect"

import { GymUserEmailAlreadyReserved } from "../../domain/errors.ts"
import { type GymUserRegistrationRecord } from "../../domain/gym-user.ts"

export const ensureGymUserEmailCanBeReserved = (
  email: string,
  existing: Option.Option<GymUserRegistrationRecord>
) =>
  Option.isSome(existing)
    ? Effect.fail(new GymUserEmailAlreadyReserved({ email }))
    : Effect.void
