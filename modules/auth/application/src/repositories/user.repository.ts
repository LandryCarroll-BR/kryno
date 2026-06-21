import type { User, UserId } from "../models/user.models"
import type { Effect, Option } from "effect"
import { Service } from "effect/Context"

export class UserRepository extends Service<
  UserRepository,
  {
    readonly createUser: (user: User) => Effect.Effect<User>
    readonly findById: (id: UserId) => Effect.Effect<Option.Option<User>>
    readonly findByUsername: (
      username: string
    ) => Effect.Effect<Option.Option<User>>
    readonly findByEmail: (
      email: string
    ) => Effect.Effect<Option.Option<User>>
  }
>()("@auth/application/UserRepository") {}
