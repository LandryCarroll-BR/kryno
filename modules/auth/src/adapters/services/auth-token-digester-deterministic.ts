import { Effect, Layer } from "effect"

import { AuthTokenDigester } from "../../ports/services/auth-token-digester.ts"

export const AuthTokenDigesterDeterministicAdapter = Layer.succeed(
  AuthTokenDigester,
  {
    digestToken: (token: string) => Effect.succeed(`digest:${token}`),
  }
)
