import { Effect } from "effect"
import * as Context from "effect/Context"

export interface GymUserEmailVerificationDelivery {
  readonly email: string
  readonly token: string
}

export class AuthEmailDelivery extends Context.Service<
  AuthEmailDelivery,
  {
    readonly sendGymUserEmailVerification: (
      delivery: GymUserEmailVerificationDelivery
    ) => Effect.Effect<void>
    readonly sentEmailVerificationTokens: Effect.Effect<
      ReadonlyArray<GymUserEmailVerificationDelivery>
    >
  }
>()("@kryno/auth/AuthEmailDelivery") {}
