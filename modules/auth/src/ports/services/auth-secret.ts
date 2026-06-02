import { Config, Effect, Layer, Redacted } from "effect"
import * as Context from "effect/Context"

export class AuthSecret extends Context.Service<
  AuthSecret,
  {
    readonly value: Redacted.Redacted<string>
  }
>()("@kryno/auth/AuthSecret") {
  static readonly layer = Layer.effect(
    AuthSecret,
    Effect.gen(function* () {
      const value = yield* Config.redacted("AUTH_SECRET")

      return { value }
    })
  )
}
