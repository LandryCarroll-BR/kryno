import { Effect } from "effect"
import * as Context from "effect/Context"

import type { GymUserId, GymUserSessionId } from "../../domain/gym-user.ts"
import type {
  SystemAdminId,
  SystemAdminSessionId,
} from "../../domain/system-admin.ts"

export class AuthIdGenerator extends Context.Service<
  AuthIdGenerator,
  {
    readonly nextGymUserId: Effect.Effect<GymUserId>
    readonly nextGymUserSessionId: Effect.Effect<GymUserSessionId>
    readonly nextSystemAdminId: Effect.Effect<SystemAdminId>
    readonly nextSystemAdminSessionId: Effect.Effect<SystemAdminSessionId>
  }
>()("@kryno/auth/AuthIdGenerator") {}
