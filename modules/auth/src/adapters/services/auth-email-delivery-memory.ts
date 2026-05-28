import { Effect, Layer } from "effect"

import {
  AuthEmailDelivery,
  type GymUserEmailVerificationDelivery,
  type GymUserPasswordResetDelivery,
} from "../../ports/services/auth-email-delivery.ts"

export const AuthEmailDeliveryMemoryAdapter = Layer.sync(
  AuthEmailDelivery,
  () => {
    const emailVerificationTokens: Array<GymUserEmailVerificationDelivery> = []
    const passwordResetTokens: Array<GymUserPasswordResetDelivery> = []

    return {
      sendGymUserEmailVerification: (
        delivery: GymUserEmailVerificationDelivery
      ) =>
        Effect.sync(() => {
          emailVerificationTokens.push(delivery)
        }),
      sendGymUserPasswordReset: (delivery: GymUserPasswordResetDelivery) =>
        Effect.sync(() => {
          passwordResetTokens.push(delivery)
        }),
      sentEmailVerificationTokens: Effect.sync(() => [
        ...emailVerificationTokens,
      ]),
      sentGymUserPasswordResetTokens: Effect.sync(() => [
        ...passwordResetTokens,
      ]),
    }
  }
)
