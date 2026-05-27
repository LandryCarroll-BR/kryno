import { Schema } from "effect"

import { SystemAdminId } from "./system-admin.ts"

export class GymUserEmailAlreadyReserved extends Schema.TaggedError<GymUserEmailAlreadyReserved>()(
  "GymUserEmailAlreadyReserved",
  {
    email: Schema.String,
  }
) {}

export class FirstSystemAdminAlreadyExists extends Schema.TaggedError<FirstSystemAdminAlreadyExists>()(
  "FirstSystemAdminAlreadyExists",
  {
    existingAdminId: SystemAdminId,
    requestedEmail: Schema.String,
  }
) {}
