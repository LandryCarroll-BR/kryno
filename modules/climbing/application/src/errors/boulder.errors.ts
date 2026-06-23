import { Data } from "effect"

import type { BoulderId } from "../models/boulder.models"
import type { ClimberId } from "../models/climber.models"

export class SavedBoulderNotFoundError extends Data.TaggedError(
  "SavedBoulderNotFoundError"
)<{
  readonly climberId: ClimberId
  readonly boulderId: BoulderId
}> {}
