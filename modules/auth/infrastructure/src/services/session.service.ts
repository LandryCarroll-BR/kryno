import { Effect, Layer } from "effect"
import { SessionService, SessionSecretHash } from "@auth/application"

export const SessionServiceLive = Layer.effect(
  SessionService,
  Effect.gen(function* () {
    const textEncoder = new TextEncoder()

    return {
      hashSessionSecret: Effect.fn("session-service/hash-secret")(
        function* (secret) {
          const secretBytes = textEncoder.encode(secret)
          const secretHashBuffer = yield* Effect.promise(() =>
            crypto.subtle.digest("SHA-256", secretBytes)
          )

          return SessionSecretHash.make(new Uint8Array(secretHashBuffer))
        }
      ),
    }
  })
)
