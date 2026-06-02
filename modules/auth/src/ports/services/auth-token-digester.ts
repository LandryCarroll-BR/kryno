import { Effect } from "effect"
import * as Context from "effect/Context"

export class AuthTokenDigester extends Context.Service<
  AuthTokenDigester,
  {
    readonly digestToken: (token: string) => Effect.Effect<string>
  }
>()("@kryno/auth/AuthTokenDigester") {}
