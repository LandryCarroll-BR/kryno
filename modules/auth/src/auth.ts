import { Effect } from "effect"
import * as Context from "effect/Context"

import {
  type FirstSystemAdminAlreadyExists,
  type GymUserEmailAlreadyReserved,
  type SystemAdminInvalidCredentials,
  type SystemAdminSessionInvalid,
} from "./domain/errors.ts"
import {
  type GymUserRegistrationRecord,
  type ReserveGymUserEmailInput,
} from "./domain/gym-user.ts"
import {
  type BootstrapFirstSystemAdminInput,
  type BootstrapFirstSystemAdminSuccess,
  type CurrentSystemAdminSessionInput,
  type CurrentSystemAdminSessionSuccess,
  type LoginSystemAdminInput,
  type LogoutSystemAdminInput,
  type SystemAdminLoginSuccess,
} from "./domain/system-admin.ts"

export class Auth extends Context.Service<
  Auth,
  {
    readonly reserveGymUserEmail: (
      input: ReserveGymUserEmailInput
    ) => Effect.Effect<GymUserRegistrationRecord, GymUserEmailAlreadyReserved>
    readonly bootstrapFirstSystemAdmin: (
      input: BootstrapFirstSystemAdminInput
    ) => Effect.Effect<
      BootstrapFirstSystemAdminSuccess,
      FirstSystemAdminAlreadyExists
    >
    readonly loginSystemAdmin: (
      input: LoginSystemAdminInput
    ) => Effect.Effect<SystemAdminLoginSuccess, SystemAdminInvalidCredentials>
    readonly currentSystemAdminSession: (
      input: CurrentSystemAdminSessionInput
    ) => Effect.Effect<
      CurrentSystemAdminSessionSuccess,
      SystemAdminSessionInvalid
    >
    readonly logoutSystemAdmin: (
      input: LogoutSystemAdminInput
    ) => Effect.Effect<void, SystemAdminSessionInvalid>
  }
>()("@kryno/auth/Auth") {}
