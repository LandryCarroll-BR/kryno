import { Effect, Layer } from "effect"
import {
  SessionService,
  SessionSecretHash,
  SessionId,
  SessionSecret,
} from "@auth/application"
import crypto from "node:crypto"

export const SessionServiceLive = Layer.effect(
  SessionService,
  Effect.gen(function* () {
    const textEncoder = new TextEncoder()

    return {
      generateSessionId: Effect.fn("SessionService.generateSessionId")(
        function* () {
          return SessionId.make(crypto.randomBytes(18).toString("base64url"))
        }
      ),
      generateSessionSecret: Effect.fn("SessionService.generateSessionSecret")(
        function* () {
          const secretBytes = crypto.getRandomValues(new Uint8Array(32))
          return SessionSecret.make(secretBytes.join(""))
        }
      ),
      hashSessionSecret: Effect.fn("SessionService.hashSessionSecret")(
        function* (secret) {
          const secretBytes = textEncoder.encode(secret)
          const secretHashBuffer = yield* Effect.promise(() =>
            crypto.subtle.digest("SHA-256", secretBytes)
          )

          return SessionSecretHash.make(new Uint8Array(secretHashBuffer))
        }
      ),
      verifySessionSecret(params) {
        return Effect.gen(function* () {
          const secretBytes = textEncoder.encode(params.secret)
          const secretHashBuffer = yield* Effect.promise(() =>
            crypto.subtle.digest("SHA-256", secretBytes)
          )

          const computedHash = new Uint8Array(secretHashBuffer)

          return computedHash.every(
            (byte, index) => byte === params.secretHash[index]
          )
        })
      },
    }
  })
)
