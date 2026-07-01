import { Effect, Layer } from "effect"
import {
  UnauthenticatedGymAdministratorError,
  UnauthorizedGymAdministratorError,
} from "@gym/application/errors/gym"
import { GymAdministratorAuthorization } from "@gym/application/services/gym-administrator-authorization"

export const GymAdministratorAuthorizationTest = Layer.succeed(
  GymAdministratorAuthorization,
  {
    authorize: Effect.fn("GymAdministratorAuthorization.authorize")(
      function* (token: string) {
        if (token === "admin-token") {
          return
        }

        if (token === "user-token") {
          return yield* new UnauthorizedGymAdministratorError()
        }

        return yield* new UnauthenticatedGymAdministratorError()
      }
    ),
  }
)
