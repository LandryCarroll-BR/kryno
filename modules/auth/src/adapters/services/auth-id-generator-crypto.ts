import { randomUUID } from "node:crypto"

import { Effect, Layer } from "effect"

import {
  GymCreationRequestId,
  GymId,
  GymStaffInvitationId,
} from "../../domain/gym.ts"
import { GymUserId, GymUserSessionId } from "../../domain/gym-user.ts"
import {
  SystemAdminId,
  SystemAdminSessionId,
} from "../../domain/system-admin.ts"
import { AuthIdGenerator } from "../../ports/services/auth-id-generator.ts"

const uuid = () => randomUUID()

export const AuthIdGeneratorCryptoAdapter = Layer.succeed(AuthIdGenerator, {
  nextGymUserId: Effect.sync(() => GymUserId.make(uuid())),
  nextGymUserSessionId: Effect.sync(() => GymUserSessionId.make(uuid())),
  nextGymId: Effect.sync(() => GymId.make(uuid())),
  nextGymCreationRequestId: Effect.sync(() => GymCreationRequestId.make(uuid())),
  nextGymStaffInvitationId: Effect.sync(() =>
    GymStaffInvitationId.make(uuid())
  ),
  nextSystemAdminId: Effect.sync(() => SystemAdminId.make(uuid())),
  nextSystemAdminSessionId: Effect.sync(() =>
    SystemAdminSessionId.make(uuid())
  ),
})
