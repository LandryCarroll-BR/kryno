import type { User } from "@/user/user.models"
import type { Effect, Option } from "effect"
import { Service } from "effect/Context"

export class UserRepository extends Service<
  UserRepository,
  {
    findByUsername: (username: string) => Effect.Effect<Option.Option<User>>
  }
>()("@auth/application/user/user.repositories/UserRepository") {}
