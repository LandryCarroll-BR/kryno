import { Effect } from "effect"
import * as Context from "effect/Context"

import type { GymId } from "../../domain/gym.ts"

export interface GymUserEmailVerificationDelivery {
  readonly email: string
  readonly token: string
}

export interface GymUserPasswordResetDelivery {
  readonly email: string
  readonly token: string
}

export interface GymStaffInvitationDelivery {
  readonly email: string
  readonly token: string
  readonly gymId: GymId
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
    readonly sendGymStaffInvitation: (
      delivery: GymStaffInvitationDelivery
    ) => Effect.Effect<void>
    readonly sentEmailVerificationTokens: Effect.Effect<
      ReadonlyArray<GymUserEmailVerificationDelivery>
    >
    readonly sentGymUserPasswordResetTokens: Effect.Effect<
      ReadonlyArray<GymUserPasswordResetDelivery>
    >
    readonly sentGymStaffInvitationTokens: Effect.Effect<
      ReadonlyArray<GymStaffInvitationDelivery>
    >
  }
>()("@kryno/auth/AuthEmailDelivery") {}
