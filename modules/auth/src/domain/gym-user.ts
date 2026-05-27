import { Schema } from "effect"

export const GymUserId = Schema.String.pipe(Schema.brand("GymUserId"))
export type GymUserId = typeof GymUserId.Type

export class GymUserRegistrationRecord extends Schema.Class<GymUserRegistrationRecord>(
  "GymUserRegistrationRecord"
)({
  id: GymUserId,
  email: Schema.String,
  displayName: Schema.String,
}) {}

export class ReserveGymUserEmailInput extends Schema.Class<ReserveGymUserEmailInput>(
  "ReserveGymUserEmailInput"
)({
  email: Schema.String,
  displayName: Schema.String,
}) {}
