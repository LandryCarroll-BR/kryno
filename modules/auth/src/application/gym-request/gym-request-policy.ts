import { Effect, Option } from "effect"

import {
  GymAccessInactive,
  GymCreationRequestInvalid,
  GymOwnerAccessDenied,
} from "../../domain/errors.ts"
import type {
  GymAffiliationRecord,
  GymCreationRequestId,
  GymCreationRequestRecord,
  GymId,
  GymRecord,
} from "../../domain/gym.ts"
import type { GymUserId } from "../../domain/gym-user.ts"

export const requirePendingGymCreationRequest = (
  requestId: GymCreationRequestId,
  request: Option.Option<GymCreationRequestRecord>
) =>
  Option.isSome(request) && request.value.status === "pending"
    ? Effect.succeed(request.value)
    : Effect.fail(new GymCreationRequestInvalid({ requestId }))

export const requireActiveGym = (
  gymId: GymId,
  gym: Option.Option<GymRecord>
) =>
  Option.isSome(gym) && gym.value.status === "active"
    ? Effect.succeed(gym.value)
    : Effect.fail(new GymAccessInactive({ gymId }))

export const requireActiveOwnerAffiliation = (
  gymId: GymId,
  userId: GymUserId,
  affiliation: Option.Option<GymAffiliationRecord>
) =>
  Option.isSome(affiliation) &&
  affiliation.value.status === "active" &&
  affiliation.value.role === "Owner"
    ? Effect.succeed(affiliation.value)
    : Effect.fail(new GymOwnerAccessDenied({ gymId, userId }))
