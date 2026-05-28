import { Effect } from "effect"
import * as Context from "effect/Context"

import {
  type GymUserEmailAlreadyReserved,
  type GymUserEmailVerificationInvalid,
  type GymUserNotFound,
} from "../../domain/errors.ts"
import {
  type GymUserEmailVerificationSuccess,
  type GymUserSignupSuccess,
  type GymUserRegistrationRecord,
  type ReserveGymUserEmailInput,
  type SignUpGymUserInput,
  type VerifyGymUserEmailInput,
} from "../../domain/gym-user.ts"

export class GymUserRegistration extends Context.Service<
  GymUserRegistration,
  {
    readonly signUp: (
      input: SignUpGymUserInput
    ) => Effect.Effect<GymUserSignupSuccess, GymUserEmailAlreadyReserved>
    readonly verifyEmail: (
      input: VerifyGymUserEmailInput
    ) => Effect.Effect<
      GymUserEmailVerificationSuccess,
      GymUserEmailVerificationInvalid | GymUserNotFound
    >
    readonly reserveEmail: (
      input: ReserveGymUserEmailInput
    ) => Effect.Effect<GymUserRegistrationRecord, GymUserEmailAlreadyReserved>
  }
>()("@kryno/auth/GymUserRegistration") {}
