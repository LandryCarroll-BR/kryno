import { Schema } from "effect"
import { BoulderId } from "./boulder.models"

export type ClimbingAttemptId = typeof ClimbingAttemptId.Type
export const ClimbingAttemptId = Schema.Trim.pipe(
  Schema.check(
    Schema.isMinLength(1, { message: "Climbing attempt id must not be empty." })
  ),
  Schema.brand("ClimbingAttemptId")
)

export type AttemptOrdinal = typeof AttemptOrdinal.Type
export const AttemptOrdinal = Schema.Number.check(
  Schema.isInt({ message: "Attempt ordinal must be an integer." }),
  Schema.isGreaterThanOrEqualTo(1, {
    message: "Attempt ordinal must be at least 1.",
  })
).pipe(Schema.brand("AttemptOrdinal"))

export const ClimbingAttemptOutcome = Schema.Literals(["FELL", "TOPPED"])
export type ClimbingAttemptOutcome = typeof ClimbingAttemptOutcome.Type

export const ClimbingDate = Schema.Date.check(
  Schema.isDateValid({ message: "Climbing date must be valid." })
)

export class ClimbingAttempt extends Schema.Class<ClimbingAttempt>(
  "ClimbingAttempt"
)({
  id: ClimbingAttemptId,
  boulderId: BoulderId,
  ordinal: AttemptOrdinal,
  outcome: ClimbingAttemptOutcome,
  occurredAt: ClimbingDate,
}) {}
