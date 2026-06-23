import { Schema } from "effect"
import { NonEmptyString } from "effect/Schema"
import { ClimbingAttempt } from "./climbing-attempt.models"

export type ClimbingSessionId = typeof ClimbingSessionId.Type
export const ClimbingSessionId = NonEmptyString.pipe(
  Schema.brand("ClimbingSessionId")
)

export class ClimbingSession extends Schema.Class<ClimbingSession>(
  "ClimbingSession"
)({
  id: ClimbingSessionId,
  attempts: Schema.Array(ClimbingAttempt),
  startTime: Schema.Date,
  endTime: Schema.Date,
}) {}
