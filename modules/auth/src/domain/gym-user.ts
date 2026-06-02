import { Schema } from "effect"

import { GymAffiliationRecord } from "./gym.ts"
import { GymUserId, GymUserSessionId } from "./gym-user-identity.ts"
export { GymUserId, GymUserSessionId } from "./gym-user-identity.ts"

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
  tokenDigest: Schema.String,
  expiresAtMillis: Schema.Number,
  active: Schema.Boolean,
}) {}

export class GymUserEmailVerificationTokenRecord extends Schema.Class<GymUserEmailVerificationTokenRecord>(
  "GymUserEmailVerificationTokenRecord"
)({
  token: Schema.String,
  userId: GymUserId,
  expiresAtMillis: Schema.Number,
  used: Schema.Boolean,
}) {}

export class GymUserPasswordResetTokenRecord extends Schema.Class<GymUserPasswordResetTokenRecord>(
  "GymUserPasswordResetTokenRecord"
)({
  token: Schema.String,
  userId: GymUserId,
  expiresAtMillis: Schema.Number,
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

export class RequestGymUserPasswordResetInput extends Schema.Class<RequestGymUserPasswordResetInput>(
  "RequestGymUserPasswordResetInput"
)({
  email: Schema.String,
}) {}

export class CompleteGymUserPasswordResetInput extends Schema.Class<CompleteGymUserPasswordResetInput>(
  "CompleteGymUserPasswordResetInput"
)({
  token: Schema.String,
  newPassword: Schema.String,
}) {}

export class GymUserLoginSuccess extends Schema.Class<GymUserLoginSuccess>(
  "GymUserLoginSuccess"
)({
  user: GymUserRegistrationRecord,
  sessionToken: GymUserSessionId,
  session: GymUserSessionRecord,
}) {}

export class CurrentGymUserSessionSuccess extends Schema.Class<CurrentGymUserSessionSuccess>(
  "CurrentGymUserSessionSuccess"
)({
  user: GymUserRegistrationRecord,
  session: GymUserSessionRecord,
  activeAffiliations: Schema.Array(Schema.suspend(() => GymAffiliationRecord)),
}) {}

export class GymUserPasswordResetRequested extends Schema.Class<GymUserPasswordResetRequested>(
  "GymUserPasswordResetRequested"
)({
  email: Schema.String,
}) {}

export class GymUserPasswordResetCompleted extends Schema.Class<GymUserPasswordResetCompleted>(
  "GymUserPasswordResetCompleted"
)({
  user: GymUserRegistrationRecord,
}) {}
