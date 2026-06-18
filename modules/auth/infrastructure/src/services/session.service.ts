import { Effect, Layer } from "effect"

import {
  SessionService,
  SessionSecretHash,
  SessionCookie,
} from "@auth/application"

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
      createSessionCookie: Effect.fn("session-service/create-session-cookie")(
        function* (session) {
          return SessionCookie.make({
            name: "session",
            value: session.token,
            attributes: {
              secure: true,
              httpOnly: true,
              sameSite: "strict",
              domain: "localhost",
              expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week
              maxAge: 60 * 60 * 24 * 7, // 1 week in seconds
              path: "/",
            },
          })
        }
      ),
    }
  })
)
