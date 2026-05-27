import { Effect } from "effect"
import * as Context from "effect/Context"

import { type GymUserEmailAlreadyReserved } from "../../domain/errors.ts"
import {
  type GymUserRegistrationRecord,
  type ReserveGymUserEmailInput,
} from "../../domain/gym-user.ts"

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
