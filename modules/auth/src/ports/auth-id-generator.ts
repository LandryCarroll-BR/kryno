import { Effect } from "effect"
import * as Context from "effect/Context"

import type { GymUserId } from "../domain/gym-user.ts"
import type { SystemAdminId } from "../domain/system-admin.ts"

export class AuthIdGenerator extends Context.Tag("@kryno/auth/AuthIdGenerator")<
  AuthIdGenerator,
  {
    readonly nextGymUserId: Effect.Effect<GymUserId>
    readonly nextSystemAdminId: Effect.Effect<SystemAdminId>
  }
>() {}
