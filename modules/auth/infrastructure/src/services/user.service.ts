import { PasswordHash, UserService } from "@auth/application"
import { Effect, Layer } from "effect"

export const UserServiceLive = Layer.effect(
  UserService,
  Effect.gen(function* () {
    const textEncoder = new TextEncoder()
    return {
      hashPassword: Effect.fn("user-service/hash-password")(function* (
        password: string
      ) {
        const passwordBytes = textEncoder.encode(password)
        const passwordHashBuffer = yield* Effect.promise(() =>
          crypto.subtle.digest("SHA-256", passwordBytes)
        )

        return PasswordHash.make(new Uint8Array(passwordHashBuffer))
      }),
    }
  })
)
