import { Data } from "effect"

import type { ClimberId } from "../models/climber.models"

export class NoActiveClimbingSessionError extends Data.TaggedError(
  "NoActiveClimbingSessionError"
)<{
  readonly climberId: ClimberId
}> {}
