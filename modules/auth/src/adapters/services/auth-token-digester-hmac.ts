import { createHmac } from "node:crypto"

import { Effect, Layer, Redacted } from "effect"

import { AuthSecret } from "../../ports/services/auth-secret.ts"
import { AuthTokenDigester } from "../../ports/services/auth-token-digester.ts"

export const AuthTokenDigesterHmacAdapter = Layer.effect(
  AuthTokenDigester,
  Effect.gen(function* () {
    const secret = yield* AuthSecret

    return {
      digestToken: (token: string) =>
        Effect.sync(() =>
          createHmac("sha256", Redacted.value(secret.value))
            .update(token, "utf8")
            .digest("base64url")
        ),
    }
  })
)
