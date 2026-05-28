import { Effect } from "effect"
import * as Context from "effect/Context"

export class AuthTokenGenerator extends Context.Service<
  AuthTokenGenerator,
  {
    readonly nextGymUserEmailVerificationToken: Effect.Effect<string>
  }
>()("@kryno/auth/AuthTokenGenerator") {}
