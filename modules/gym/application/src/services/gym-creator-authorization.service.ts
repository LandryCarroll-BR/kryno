import type { Effect } from "effect"
import { Service } from "effect/Context"

import type {
  UnauthenticatedGymCreatorError,
  UnauthorizedGymCreatorError,
} from "../errors/gym.errors"

export class GymCreatorAuthorization extends Service<
  GymCreatorAuthorization,
  {
    readonly authorize: (
      token: string
    ) => Effect.Effect<
      void,
      UnauthenticatedGymCreatorError | UnauthorizedGymCreatorError
    >
  }
>()("@gym/application/GymCreatorAuthorization") {}
