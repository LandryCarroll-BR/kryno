import { Schema } from "effect"

export const SystemAdminId = Schema.String.pipe(Schema.brand("SystemAdminId"))
export type SystemAdminId = typeof SystemAdminId.Type

export class SystemAdminRecord extends Schema.Class<SystemAdminRecord>(
  "SystemAdminRecord"
)({
  id: SystemAdminId,
  email: Schema.String,
}) {}

export class SystemAdminCredentialRecord extends Schema.Class<SystemAdminCredentialRecord>(
  "SystemAdminCredentialRecord"
)({
  adminId: SystemAdminId,
  passwordHash: Schema.String,
}) {}

export class BootstrapFirstSystemAdminInput extends Schema.Class<BootstrapFirstSystemAdminInput>(
  "BootstrapFirstSystemAdminInput"
)({
  email: Schema.String,
  password: Schema.String,
}) {}

export class FirstSystemAdminCreated extends Schema.TaggedClass<FirstSystemAdminCreated>()(
  "FirstSystemAdminCreated",
  {
    admin: SystemAdminRecord,
    credential: SystemAdminCredentialRecord,
  }
) {}

export class FirstSystemAdminAlreadyBootstrapped extends Schema.TaggedClass<FirstSystemAdminAlreadyBootstrapped>()(
  "FirstSystemAdminAlreadyBootstrapped",
  {
    admin: SystemAdminRecord,
  }
) {}

export const BootstrapFirstSystemAdminSuccess = Schema.Union([
  FirstSystemAdminCreated,
  FirstSystemAdminAlreadyBootstrapped,
])
export type BootstrapFirstSystemAdminSuccess =
  typeof BootstrapFirstSystemAdminSuccess.Type
