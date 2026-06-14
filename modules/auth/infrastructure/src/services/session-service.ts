import { Effect, Layer } from "effect"

import {
  SessionService,
  SessionId,
  SessionSecret,
  SessionSecretHash,
} from "@auth/application"

export const SessionServiceLive = Layer.effect(
  SessionService,
  Effect.gen(function* () {
    const textEncoder = new TextEncoder()

    return {
      generateId: Effect.fn("session-service/generate-id")(function* () {
        return SessionId.make(generateSecureRandomString())
      }),

      generateSecret: Effect.fn("session-service/generate-secret")(
        function* () {
          return SessionSecret.make(generateSecureRandomString())
        }
      ),

      hashSecret: Effect.fn("session-service/hash-secret")(function* (secret) {
        const digest = yield* Effect.promise(() =>
          crypto.subtle.digest("SHA-256", textEncoder.encode(secret))
        )

        return SessionSecretHash.make(new Uint8Array(digest))
      }),
    }
  })
)

const generateSecureRandomString = () => {
  // Human readable alphabet (a-z, 0-9 without l, o, 0, 1 to avoid confusion)
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789"

  // Generate 24 bytes = 192 bits of entropy.
  // We're only going to use 5 bits per byte so the total entropy will be 192 * 5 / 8 = 120 bits
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)

  let id = ""
  for (let i = 0; i < bytes.length; i++) {
    // >> 3 "removes" the right-most 3 bits of the byte
    id += alphabet[bytes[i] >> 3]
  }
  return id
}
