import { randomBytes } from "node:crypto"

import { Effect, Layer } from "effect"

import { AuthTokenGenerator } from "../../ports/services/auth-token-generator.ts"

const token = () => randomBytes(32).toString("base64url")

export const AuthTokenGeneratorCryptoAdapter = Layer.succeed(
  AuthTokenGenerator,
  {
    nextGymUserEmailVerificationToken: Effect.sync(token),
    nextGymUserPasswordResetToken: Effect.sync(token),
    nextGymStaffInvitationToken: Effect.sync(token),
  }
)
