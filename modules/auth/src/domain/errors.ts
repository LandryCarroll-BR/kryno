import { Schema } from "effect"

import { SystemAdminId } from "./system-admin.ts"

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
