import { Effect } from "effect"
import * as Context from "effect/Context"

export interface GymUserEmailVerificationDelivery {
  readonly email: string
  readonly token: string
}

export interface GymUserPasswordResetDelivery {
  readonly email: string
  readonly token: string
}

export class AuthEmailDelivery extends Context.Service<
  AuthEmailDelivery,
  {
    readonly sendGymUserEmailVerification: (
      delivery: GymUserEmailVerificationDelivery
    ) => Effect.Effect<void>
    readonly sendGymUserPasswordReset: (
      delivery: GymUserPasswordResetDelivery
    ) => Effect.Effect<void>
    readonly sentEmailVerificationTokens: Effect.Effect<
      ReadonlyArray<GymUserEmailVerificationDelivery>
    >
    readonly sentGymUserPasswordResetTokens: Effect.Effect<
      ReadonlyArray<GymUserPasswordResetDelivery>
    >
  }
>()("@kryno/auth/AuthEmailDelivery") {}
