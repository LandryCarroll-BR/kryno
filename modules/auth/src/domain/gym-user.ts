import { Schema } from "effect"

export const GymUserId = Schema.String.pipe(Schema.brand("GymUserId"))
export type GymUserId = typeof GymUserId.Type

export const GymUserSessionId = Schema.String.pipe(
  Schema.brand("GymUserSessionId")
)
export type GymUserSessionId = typeof GymUserSessionId.Type

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

export class GymUserSessionRecord extends Schema.Class<GymUserSessionRecord>(
  "GymUserSessionRecord"
)({
  id: GymUserSessionId,
  userId: GymUserId,
  active: Schema.Boolean,
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

export class LoginGymUserInput extends Schema.Class<LoginGymUserInput>(
  "LoginGymUserInput"
)({
  email: Schema.String,
  password: Schema.String,
}) {}

export class CurrentGymUserSessionInput extends Schema.Class<CurrentGymUserSessionInput>(
  "CurrentGymUserSessionInput"
)({
  sessionId: GymUserSessionId,
}) {}

export class LogoutGymUserInput extends Schema.Class<LogoutGymUserInput>(
  "LogoutGymUserInput"
)({
  sessionId: GymUserSessionId,
}) {}

export class GymUserLoginSuccess extends Schema.Class<GymUserLoginSuccess>(
  "GymUserLoginSuccess"
)({
  user: GymUserRegistrationRecord,
  session: GymUserSessionRecord,
}) {}

export class CurrentGymUserSessionSuccess extends Schema.Class<CurrentGymUserSessionSuccess>(
  "CurrentGymUserSessionSuccess"
)({
  user: GymUserRegistrationRecord,
  session: GymUserSessionRecord,
}) {}
