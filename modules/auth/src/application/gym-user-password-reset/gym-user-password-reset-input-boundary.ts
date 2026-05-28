import { Effect } from "effect"
import * as Context from "effect/Context"

import {
  type GymUserNotFound,
  type GymUserPasswordResetTokenAlreadyUsed,
  type GymUserPasswordResetTokenExpired,
  type GymUserPasswordResetTokenInvalid,
  type GymUserPasswordResetUnknownEmail,
} from "../../domain/errors.ts"
import {
  type CompleteGymUserPasswordResetInput,
  type GymUserPasswordResetCompleted,
  type GymUserPasswordResetRequested,
  type RequestGymUserPasswordResetInput,
} from "../../domain/gym-user.ts"

export class GymUserPasswordReset extends Context.Service<
  GymUserPasswordReset,
  {
    readonly request: (
      input: RequestGymUserPasswordResetInput
    ) => Effect.Effect<
      GymUserPasswordResetRequested,
      GymUserPasswordResetUnknownEmail
    >
    readonly complete: (
      input: CompleteGymUserPasswordResetInput
    ) => Effect.Effect<
      GymUserPasswordResetCompleted,
      | GymUserPasswordResetTokenInvalid
      | GymUserPasswordResetTokenExpired
      | GymUserPasswordResetTokenAlreadyUsed
      | GymUserNotFound
    >
  }
>()("@kryno/auth/GymUserPasswordReset") {}
