import { Data } from "effect"

import type {
  GymMemberId,
} from "../models/gym-membership.models"
import type { GymId } from "../models/gym.models"

export class UnauthenticatedGymMemberError extends Data.TaggedError(
  "UnauthenticatedGymMemberError"
) {}

export class GymNotFoundError extends Data.TaggedError("GymNotFoundError")<{
  readonly gymId: GymId
}> {}

export class GymMembershipAlreadyExistsError extends Data.TaggedError(
  "GymMembershipAlreadyExistsError"
)<{
  readonly gymId: GymId
  readonly memberId: GymMemberId
}> {}
