import { Effect } from "effect"
import * as Context from "effect/Context"

import type {
  GymCreationRequestId,
  GymId,
  GymStaffInvitationId,
} from "../../domain/gym.ts"
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
    readonly nextGymId: Effect.Effect<GymId>
    readonly nextGymCreationRequestId: Effect.Effect<GymCreationRequestId>
    readonly nextGymStaffInvitationId: Effect.Effect<GymStaffInvitationId>
    readonly nextSystemAdminId: Effect.Effect<SystemAdminId>
    readonly nextSystemAdminSessionId: Effect.Effect<SystemAdminSessionId>
  }
>()("@kryno/auth/AuthIdGenerator") {}
