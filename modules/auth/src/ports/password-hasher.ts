import { Effect } from "effect"
import * as Context from "effect/Context"

export class PasswordHasher extends Context.Tag("@kryno/auth/PasswordHasher")<
  PasswordHasher,
  {
    readonly hashPassword: (password: string) => Effect.Effect<string>
  }
>() {}
