import { Effect, Layer } from "effect"
import {
  UnauthenticatedGymCreatorError,
  UnauthorizedGymCreatorError,
} from "@gym/application/errors/gym"

import { GymCreatorAuthorization } from "@gym/application/services/gym-creator-authorization"

export const GymCreatorAuthorizationTest = Layer.succeed(
  GymCreatorAuthorization,
  {
    authorize: Effect.fn("GymCreatorAuthorization.authorize")(function* (
      token: string
    ) {
      if (token === "admin-token") {
        return
      }

      if (token === "user-token") {
        return yield* new UnauthorizedGymCreatorError()
      }

      return yield* new UnauthenticatedGymCreatorError()
    }),
  }
)
