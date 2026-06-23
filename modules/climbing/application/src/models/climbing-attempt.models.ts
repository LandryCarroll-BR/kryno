import { Schema } from "effect"
import { NonEmptyString } from "effect/Schema"
import { Climber } from "./climber.models"
import { Boulder } from "./boulder.models"

export type ClimbingAttemptId = typeof ClimbingAttemptId.Type
export const ClimbingAttemptId = NonEmptyString.pipe(
  Schema.brand("ClimbingAttemptId")
)

export class ClimbingAttempt extends Schema.Class<ClimbingAttempt>(
  "ClimbingAttempt"
)({
  id: ClimbingAttemptId,
  boulder: Boulder,
  climber: Climber,
  attemptNumber: Schema.Number,
  didTopBoulder: Schema.Boolean,
}) {}
