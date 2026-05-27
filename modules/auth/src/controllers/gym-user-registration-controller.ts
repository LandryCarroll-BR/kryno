import { Schema } from "effect"

export class ReserveGymUserEmailRequest extends Schema.Class<ReserveGymUserEmailRequest>(
  "ReserveGymUserEmailRequest"
)({
  email: Schema.String,
  displayName: Schema.String,
}) {}

export class ReserveGymUserEmailSuccess extends Schema.TaggedClass<ReserveGymUserEmailSuccess>(
  "ReserveGymUserEmailSuccess"
)("success", {
  userId: Schema.String,
  email: Schema.String,
  displayName: Schema.String,
}) {}

export class ReserveGymUserEmailFailure extends Schema.TaggedClass<ReserveGymUserEmailFailure>(
  "ReserveGymUserEmailFailure"
)("emailAlreadyReserved", {
  email: Schema.String,
}) {}

export const ReserveGymUserEmailResult = Schema.Union(
  ReserveGymUserEmailSuccess,
  ReserveGymUserEmailFailure
)
export type ReserveGymUserEmailResult = typeof ReserveGymUserEmailResult.Type
