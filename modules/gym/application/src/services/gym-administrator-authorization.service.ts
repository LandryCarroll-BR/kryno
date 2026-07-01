import type { Effect } from "effect"
import { Service } from "effect/Context"

import type {
  UnauthenticatedGymAdministratorError,
  UnauthorizedGymAdministratorError,
} from "../errors/gym.errors"

export class GymAdministratorAuthorization extends Service<
  GymAdministratorAuthorization,
  {
    readonly authorize: (
      token: string
    ) => Effect.Effect<
      void,
      | UnauthenticatedGymAdministratorError
      | UnauthorizedGymAdministratorError
    >
  }
>()("@gym/application/GymAdministratorAuthorization") {}
