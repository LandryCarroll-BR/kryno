import { Schema } from "effect"

export const SystemAdminId = Schema.String.pipe(Schema.brand("SystemAdminId"))
export type SystemAdminId = typeof SystemAdminId.Type

export const SystemAdminSessionId = Schema.String.pipe(
  Schema.brand("SystemAdminSessionId")
)
export type SystemAdminSessionId = typeof SystemAdminSessionId.Type

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

export class SystemAdminSessionRecord extends Schema.Class<SystemAdminSessionRecord>(
  "SystemAdminSessionRecord"
)({
  id: SystemAdminSessionId,
  adminId: SystemAdminId,
  tokenDigest: Schema.String,
  active: Schema.Boolean,
}) {}

export class BootstrapFirstSystemAdminInput extends Schema.Class<BootstrapFirstSystemAdminInput>(
  "BootstrapFirstSystemAdminInput"
)({
  email: Schema.String,
  password: Schema.String,
}) {}

export class LoginSystemAdminInput extends Schema.Class<LoginSystemAdminInput>(
  "LoginSystemAdminInput"
)({
  email: Schema.String,
  password: Schema.String,
}) {}

export class CurrentSystemAdminSessionInput extends Schema.Class<CurrentSystemAdminSessionInput>(
  "CurrentSystemAdminSessionInput"
)({
  sessionId: SystemAdminSessionId,
}) {}

export class LogoutSystemAdminInput extends Schema.Class<LogoutSystemAdminInput>(
  "LogoutSystemAdminInput"
)({
  sessionId: SystemAdminSessionId,
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

export class SystemAdminLoginSuccess extends Schema.Class<SystemAdminLoginSuccess>(
  "SystemAdminLoginSuccess"
)({
  admin: SystemAdminRecord,
  sessionToken: SystemAdminSessionId,
  session: SystemAdminSessionRecord,
}) {}

export class CurrentSystemAdminSessionSuccess extends Schema.Class<CurrentSystemAdminSessionSuccess>(
  "CurrentSystemAdminSessionSuccess"
)({
  admin: SystemAdminRecord,
  session: SystemAdminSessionRecord,
}) {}
