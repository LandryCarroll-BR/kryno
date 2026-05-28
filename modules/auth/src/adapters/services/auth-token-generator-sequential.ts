import { Effect, Layer } from "effect"

import { AuthTokenGenerator } from "../../ports/services/auth-token-generator.ts"

export const AuthTokenGeneratorSequentialAdapter = Layer.sync(
  AuthTokenGenerator,
  () => {
    let nextGymUserEmailVerificationToken = 1
    let nextGymUserPasswordResetToken = 1

    return {
      nextGymUserEmailVerificationToken: Effect.sync(
        () =>
          `gym-user-email-verification-token-${nextGymUserEmailVerificationToken++}`
      ),
      nextGymUserPasswordResetToken: Effect.sync(
        () => `gym-user-password-reset-token-${nextGymUserPasswordResetToken++}`
      ),
    }
  }
)
