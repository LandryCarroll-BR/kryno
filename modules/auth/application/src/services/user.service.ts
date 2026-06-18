import type { Effect } from "effect"
import { Service } from "effect/Context"

import type { PasswordHash } from "../models/user.models"

export class UserService extends Service<
  UserService,
  {
    hashPassword: (password: string) => Effect.Effect<PasswordHash>
  }
>()("@workspace/auth/application/services/user-service") {}
