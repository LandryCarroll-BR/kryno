import type { User } from "../models/user.models"
import type { Effect, Option } from "effect"
import { Service } from "effect/Context"

export class UserRepository extends Service<
  UserRepository,
  {
    createUser: (user: User) => Effect.Effect<User>
    findByUsername: (username: string) => Effect.Effect<Option.Option<User>>
  }
>()("@auth/application/user/user.repositories/UserRepository") {}
