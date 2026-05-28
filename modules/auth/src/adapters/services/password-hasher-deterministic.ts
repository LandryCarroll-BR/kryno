import { Effect, Layer } from "effect"

import { PasswordHasher } from "../../ports/services/password-hasher.ts"

export const PasswordHasherDeterministicAdapter = Layer.succeed(
  PasswordHasher,
  {
    hashPassword: (password: string) => Effect.succeed(`hashed:${password}`),
    verifyPassword: (password: string, passwordHash: string) =>
      Effect.succeed(passwordHash === `hashed:${password}`),
  }
)
