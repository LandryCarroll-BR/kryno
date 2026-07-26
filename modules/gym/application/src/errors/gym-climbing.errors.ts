import { Data } from "effect"

import type { GymMemberId } from "../models/gym-membership.models"

export class NoActiveGymClimbingSessionError extends Data.TaggedError(
  "NoActiveGymClimbingSessionError"
)<{
  readonly memberId: GymMemberId
}> {}
