import { Effect, Layer } from "effect"

import {
  AuthEmailDelivery,
  type GymUserEmailVerificationDelivery,
} from "../../ports/services/auth-email-delivery.ts"

export const AuthEmailDeliveryMemoryAdapter = Layer.sync(
  AuthEmailDelivery,
  () => {
    const emailVerificationTokens: Array<GymUserEmailVerificationDelivery> = []

    return {
      sendGymUserEmailVerification: (
        delivery: GymUserEmailVerificationDelivery
      ) =>
        Effect.sync(() => {
          emailVerificationTokens.push(delivery)
        }),
      sentEmailVerificationTokens: Effect.sync(() => [
        ...emailVerificationTokens,
      ]),
    }
  }
)
