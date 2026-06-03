import { Effect } from "effect"
import * as Context from "effect/Context"
import type { PersistenceError } from "@workspace/drizzle"

import {
  type SystemAdminInvalidCredentials,
  type SystemAdminSessionInvalid,
} from "../../domain/errors.ts"
import {
  type CurrentSystemAdminSessionInput,
  type CurrentSystemAdminSessionSuccess,
  type LoginSystemAdminInput,
  type LogoutSystemAdminInput,
  type SystemAdminLoginSuccess,
} from "../../domain/system-admin.ts"

export class SystemAdminAuthentication extends Context.Service<
  SystemAdminAuthentication,
  {
    readonly login: (
      input: LoginSystemAdminInput
    ) => Effect.Effect<
      SystemAdminLoginSuccess,
      SystemAdminInvalidCredentials | PersistenceError
    >
    readonly currentSession: (
      input: CurrentSystemAdminSessionInput
    ) => Effect.Effect<
      CurrentSystemAdminSessionSuccess,
      SystemAdminSessionInvalid | PersistenceError
    >
    readonly logout: (
      input: LogoutSystemAdminInput
    ) => Effect.Effect<void, SystemAdminSessionInvalid | PersistenceError>
  }
>()("@kryno/auth/SystemAdminAuthentication") {}
