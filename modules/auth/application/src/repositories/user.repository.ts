import type { User } from "../models/user.models"
import type { Effect, Option } from "effect"
import { Service } from "effect/Context"

export class UserRepository extends Service<
  UserRepository,
  {
    readonly createUser: (user: User) => Effect.Effect<User>
    readonly findByUsername: (
      username: string
    ) => Effect.Effect<Option.Option<User>>
    readonly findByEmail: (
      email: string
    ) => Effect.Effect<Option.Option<User>>
  }
>()("@auth/application/UserRepository") {}
