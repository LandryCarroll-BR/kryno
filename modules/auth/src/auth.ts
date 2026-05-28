import { Effect } from "effect"
import * as Context from "effect/Context"

import {
  type FirstSystemAdminAlreadyExists,
  type GymUserEmailAlreadyReserved,
} from "./domain/errors.ts"
import {
  type GymUserRegistrationRecord,
  type ReserveGymUserEmailInput,
} from "./domain/gym-user.ts"
import {
  type BootstrapFirstSystemAdminInput,
  type BootstrapFirstSystemAdminSuccess,
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
  }
>()("@kryno/auth/Auth") {}
