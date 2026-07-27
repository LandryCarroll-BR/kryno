import { Effect, Option, Schema } from "effect"
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

export const ClimbingAttemptMoveType = Schema.Literals([
  "DYNO",
  "DEADPOINT",
  "HEEL_HOOK",
  "TOE_HOOK",
  "DROP_KNEE",
  "FLAG",
  "MATCH",
  "MANTLE",
  "SMEAR",
  "CAMPUS",
  "COMPRESSION",
  "GASTON",
  "UNDERCLING",
  "SIDEPULL",
  "CRIMP",
  "PINCH",
  "SLOPER",
])
export type ClimbingAttemptMoveType = typeof ClimbingAttemptMoveType.Type

export const ClimbingDate = Schema.Date.check(
  Schema.isDateValid({ message: "Climbing date must be valid." })
)

export type ClimbingAttemptVideoUrl = typeof ClimbingAttemptVideoUrl.Type
export const ClimbingAttemptVideoUrl = Schema.NonEmptyString.pipe(
  Schema.brand("ClimbingAttemptVideoUrl")
)

export const ClimbingAttemptVideoContentType = Schema.Literals([
  "video/mp4",
  "video/webm",
])
export type ClimbingAttemptVideoContentType =
  typeof ClimbingAttemptVideoContentType.Type

export type ClimbingAttemptVideoBytes =
  typeof ClimbingAttemptVideoBytes.Type
export const ClimbingAttemptVideoBytes = Schema.Uint8Array.pipe(
  Schema.check(
    Schema.makeFilter((value) =>
      value.byteLength > 0 && value.byteLength <= 50 * 1024 * 1024
        ? undefined
        : "Attempt video must be between 1 byte and 50 MB."
    )
  ),
  Schema.brand("ClimbingAttemptVideoBytes")
)

export class ClimbingAttemptVideoUpload extends Schema.Class<ClimbingAttemptVideoUpload>(
  "ClimbingAttemptVideoUpload"
)({
  bytes: ClimbingAttemptVideoBytes,
  contentType: ClimbingAttemptVideoContentType,
  fileName: Schema.NonEmptyString,
}) {}

export class ClimbingAttempt extends Schema.Class<ClimbingAttempt>(
  "ClimbingAttempt"
)({
  id: ClimbingAttemptId,
  boulderId: BoulderId,
  ordinal: AttemptOrdinal,
  outcome: ClimbingAttemptOutcome,
  moveTypes: Schema.Array(ClimbingAttemptMoveType),
  occurredAt: ClimbingDate,
  videoUrl: Schema.OptionFromNullOr(ClimbingAttemptVideoUrl).pipe(
    Schema.withConstructorDefault(Effect.succeed(Option.none()))
  ),
}) {}
