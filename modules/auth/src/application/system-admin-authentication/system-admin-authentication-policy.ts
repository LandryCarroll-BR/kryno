import { Effect, Option } from "effect"

import {
  SystemAdminInvalidCredentials,
  SystemAdminSessionInvalid,
} from "../../domain/errors.ts"
import type {
  SystemAdminCredentialRecord,
  SystemAdminRecord,
  SystemAdminSessionId,
  SystemAdminSessionRecord,
} from "../../domain/system-admin.ts"

export const requireSystemAdminCredential = (
  email: string,
  admin: Option.Option<SystemAdminRecord>,
  credential: Option.Option<SystemAdminCredentialRecord>
) =>
  Option.isSome(admin) && Option.isSome(credential)
    ? Effect.succeed({ admin: admin.value, credential: credential.value })
    : Effect.fail(new SystemAdminInvalidCredentials({ email }))

export const requireActiveSystemAdminSession = (
  sessionId: SystemAdminSessionId,
  session: Option.Option<SystemAdminSessionRecord>
) =>
  Option.isSome(session) && session.value.active
    ? Effect.succeed(session.value)
    : Effect.fail(new SystemAdminSessionInvalid({ sessionId }))
