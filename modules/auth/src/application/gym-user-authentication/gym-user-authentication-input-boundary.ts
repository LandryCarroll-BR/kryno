import { Effect } from "effect"
import * as Context from "effect/Context"

import {
  type GymUserInvalidCredentials,
  type GymUserSessionInvalid,
  type GymUserUnverified,
} from "../../domain/errors.ts"
import {
  type CurrentGymUserSessionInput,
  type CurrentGymUserSessionSuccess,
  type GymUserLoginSuccess,
  type LoginGymUserInput,
  type LogoutGymUserInput,
} from "../../domain/gym-user.ts"

export class GymUserAuthentication extends Context.Service<
  GymUserAuthentication,
  {
    readonly login: (
      input: LoginGymUserInput
    ) => Effect.Effect<
      GymUserLoginSuccess,
      GymUserInvalidCredentials | GymUserUnverified
    >
    readonly currentSession: (
      input: CurrentGymUserSessionInput
    ) => Effect.Effect<
      CurrentGymUserSessionSuccess,
      GymUserSessionInvalid | GymUserUnverified
    >
    readonly logout: (
      input: LogoutGymUserInput
    ) => Effect.Effect<void, GymUserSessionInvalid>
  }
>()("@kryno/auth/GymUserAuthentication") {}
