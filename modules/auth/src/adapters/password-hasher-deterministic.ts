import { Effect, Layer } from "effect"

import { PasswordHasher } from "../ports/password-hasher.ts"

export const PasswordHasherDeterministicAdapter = Layer.succeed(
  PasswordHasher,
  {
    hashPassword: (password: string) => Effect.succeed(`hashed:${password}`),
  }
)
