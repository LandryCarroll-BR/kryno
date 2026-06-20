import type { Effect } from "effect"
import { Service } from "effect/Context"

import type { PasswordHash } from "../models/user.models"

export class UserService extends Service<
  UserService,
  {
    readonly hashPassword: (password: string) => Effect.Effect<PasswordHash>
    readonly validatePasswords: (params: {
      password: string
      passwordHash: PasswordHash
    }) => Effect.Effect<boolean>
  }
>()("@auth/application/UserService") {}
