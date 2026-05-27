import { Effect, Option } from "effect"

import {
  GymUserEmailAlreadyReserved,
  type GymUserRegistrationRecord,
} from "../domain/index.ts"

export const ensureGymUserEmailCanBeReserved = (
  email: string,
  existing: Option.Option<GymUserRegistrationRecord>
) =>
  Option.isSome(existing)
    ? Effect.fail(new GymUserEmailAlreadyReserved({ email }))
    : Effect.void
