import { Schema } from "effect"

import { SystemAdminId, SystemAdminSessionId } from "./system-admin.ts"

export class GymUserEmailAlreadyReserved extends Schema.TaggedErrorClass<GymUserEmailAlreadyReserved>()(
  "GymUserEmailAlreadyReserved",
  {
    email: Schema.String,
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
