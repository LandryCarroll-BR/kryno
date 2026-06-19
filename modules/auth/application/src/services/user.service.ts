import type { Effect } from "effect"
import { Service } from "effect/Context"

import type { PasswordHash } from "../models/user.models"

export class UserService extends Service<
  UserService,
  {
    hashPassword: (password: string) => Effect.Effect<PasswordHash>
    validatePasswords: (params: {
      password: string
      passwordHash: PasswordHash
    }) => Effect.Effect<boolean>
  }
>()("@workspace/auth/application/services/user-service") {}
