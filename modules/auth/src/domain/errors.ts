import { Schema } from "effect"

import { GymCreationRequestId, GymId } from "./gym.ts"
import { GymUserId, GymUserSessionId } from "./gym-user.ts"
import { SystemAdminId, SystemAdminSessionId } from "./system-admin.ts"

export class GymUserEmailAlreadyReserved extends Schema.TaggedErrorClass<GymUserEmailAlreadyReserved>()(
  "GymUserEmailAlreadyReserved",
  {
    email: Schema.String,
  }
) {}

export class GymUserEmailVerificationInvalid extends Schema.TaggedErrorClass<GymUserEmailVerificationInvalid>()(
  "GymUserEmailVerificationInvalid",
  {
    token: Schema.String,
  }
) {}

export class GymUserNotFound extends Schema.TaggedErrorClass<GymUserNotFound>()(
  "GymUserNotFound",
  {
    userId: GymUserId,
  }
) {}

export class GymUserInvalidCredentials extends Schema.TaggedErrorClass<GymUserInvalidCredentials>()(
  "GymUserInvalidCredentials",
  {
    email: Schema.String,
  }
) {}

export class GymUserUnverified extends Schema.TaggedErrorClass<GymUserUnverified>()(
  "GymUserUnverified",
  {
    userId: GymUserId,
  }
) {}

export class GymUserSessionInvalid extends Schema.TaggedErrorClass<GymUserSessionInvalid>()(
  "GymUserSessionInvalid",
  {
    sessionId: GymUserSessionId,
  }
) {}

export class GymUserPasswordResetUnknownEmail extends Schema.TaggedErrorClass<GymUserPasswordResetUnknownEmail>()(
  "GymUserPasswordResetUnknownEmail",
  {
    email: Schema.String,
  }
) {}

export class GymUserPasswordResetTokenInvalid extends Schema.TaggedErrorClass<GymUserPasswordResetTokenInvalid>()(
  "GymUserPasswordResetTokenInvalid",
  {
    token: Schema.String,
  }
) {}

export class GymUserPasswordResetTokenExpired extends Schema.TaggedErrorClass<GymUserPasswordResetTokenExpired>()(
  "GymUserPasswordResetTokenExpired",
  {
    token: Schema.String,
  }
) {}

export class GymUserPasswordResetTokenAlreadyUsed extends Schema.TaggedErrorClass<GymUserPasswordResetTokenAlreadyUsed>()(
  "GymUserPasswordResetTokenAlreadyUsed",
  {
    token: Schema.String,
  }
) {}

export class GymCreationRequestInvalid extends Schema.TaggedErrorClass<GymCreationRequestInvalid>()(
  "GymCreationRequestInvalid",
  {
    requestId: GymCreationRequestId,
  }
) {}

export class GymAccessInactive extends Schema.TaggedErrorClass<GymAccessInactive>()(
  "GymAccessInactive",
  {
    gymId: GymId,
  }
) {}

export class GymOwnerAccessDenied extends Schema.TaggedErrorClass<GymOwnerAccessDenied>()(
  "GymOwnerAccessDenied",
  {
    gymId: GymId,
    userId: GymUserId,
  }
) {}

export class GymStaffSelfAssignmentDenied extends Schema.TaggedErrorClass<GymStaffSelfAssignmentDenied>()(
  "GymStaffSelfAssignmentDenied",
  {
    gymId: GymId,
    userId: GymUserId,
  }
) {}

export class GymStaffInvitationInvalid extends Schema.TaggedErrorClass<GymStaffInvitationInvalid>()(
  "GymStaffInvitationInvalid",
  {
    token: Schema.String,
  }
) {}

export class GymMemberAffiliationInvalid extends Schema.TaggedErrorClass<GymMemberAffiliationInvalid>()(
  "GymMemberAffiliationInvalid",
  {
    gymId: GymId,
    userId: GymUserId,
  }
) {}

export class FirstSystemAdminAlreadyExists extends Schema.TaggedErrorClass<FirstSystemAdminAlreadyExists>()(
  "FirstSystemAdminAlreadyExists",
  {
    existingAdminId: SystemAdminId,
    requestedEmail: Schema.String,
  }
) {}

export class SystemAdminInvalidCredentials extends Schema.TaggedErrorClass<SystemAdminInvalidCredentials>()(
  "SystemAdminInvalidCredentials",
  {
    email: Schema.String,
  }
) {}

export class SystemAdminSessionInvalid extends Schema.TaggedErrorClass<SystemAdminSessionInvalid>()(
  "SystemAdminSessionInvalid",
  {
    sessionId: SystemAdminSessionId,
  }
) {}
