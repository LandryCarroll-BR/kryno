import { Data } from "effect"

import type { BoulderId } from "../models/boulder.models"
import type { ClimberId } from "../models/climber.models"

export class SavedBoulderNotFoundError extends Data.TaggedError(
  "SavedBoulderNotFoundError"
)<{
  readonly climberId: ClimberId
  readonly boulderId: BoulderId
}> {}

export class CreatedBoulderNotFoundError extends Data.TaggedError(
  "CreatedBoulderNotFoundError"
)<{
  readonly climberId: ClimberId
  readonly boulderId: BoulderId
}> {}

export class UnauthorizedToDeleteBoulderError extends Data.TaggedError(
  "UnauthorizedToDeleteBoulderError"
)<{
  readonly climberId: ClimberId
  readonly boulderId: BoulderId
}> {}
