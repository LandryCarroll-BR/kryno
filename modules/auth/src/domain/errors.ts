import { Schema } from "effect"

import { GymUserId } from "./gym-user.ts"
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
