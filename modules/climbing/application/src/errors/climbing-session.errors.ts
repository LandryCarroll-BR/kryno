import { Data } from "effect"

import type { ClimberId } from "../models/climber.models"
import type { ClimbingSessionId } from "../models/climbing-session.models"

export class NoActiveClimbingSessionError extends Data.TaggedError(
  "NoActiveClimbingSessionError"
)<{
  readonly climberId: ClimberId
}> {}

export class PastClimbingSessionNotFoundError extends Data.TaggedError(
  "PastClimbingSessionNotFoundError"
)<{
  readonly climberId: ClimberId
  readonly climbingSessionId: ClimbingSessionId
}> {}

export class ActiveClimbingSessionCannotBeDeletedError extends Data.TaggedError(
  "ActiveClimbingSessionCannotBeDeletedError"
)<{
  readonly climberId: ClimberId
  readonly climbingSessionId: ClimbingSessionId
}> {}
