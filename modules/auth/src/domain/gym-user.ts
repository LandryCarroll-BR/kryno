import { Schema } from "effect"

export const GymUserId = Schema.String.pipe(Schema.brand("GymUserId"))
export type GymUserId = typeof GymUserId.Type

export class GymUserRegistrationRecord extends Schema.Class<GymUserRegistrationRecord>(
  "GymUserRegistrationRecord"
)({
  id: GymUserId,
  email: Schema.String,
  displayName: Schema.String,
  emailVerified: Schema.Boolean,
}) {}

export class ReserveGymUserEmailInput extends Schema.Class<ReserveGymUserEmailInput>(
  "ReserveGymUserEmailInput"
)({
  email: Schema.String,
  displayName: Schema.String,
}) {}

export class SignUpGymUserInput extends Schema.Class<SignUpGymUserInput>(
  "SignUpGymUserInput"
)({
  email: Schema.String,
  password: Schema.String,
  displayName: Schema.String,
}) {}

export class VerifyGymUserEmailInput extends Schema.Class<VerifyGymUserEmailInput>(
  "VerifyGymUserEmailInput"
)({
  token: Schema.String,
}) {}

export class GymUserCredentialRecord extends Schema.Class<GymUserCredentialRecord>(
  "GymUserCredentialRecord"
)({
  userId: GymUserId,
  passwordHash: Schema.String,
}) {}

export class GymUserEmailVerificationTokenRecord extends Schema.Class<GymUserEmailVerificationTokenRecord>(
  "GymUserEmailVerificationTokenRecord"
)({
  token: Schema.String,
  userId: GymUserId,
  used: Schema.Boolean,
}) {}

export class GymUserSignupSuccess extends Schema.Class<GymUserSignupSuccess>(
  "GymUserSignupSuccess"
)({
  user: GymUserRegistrationRecord,
}) {}

export class GymUserEmailVerificationSuccess extends Schema.Class<GymUserEmailVerificationSuccess>(
  "GymUserEmailVerificationSuccess"
)({
  user: GymUserRegistrationRecord,
}) {}
