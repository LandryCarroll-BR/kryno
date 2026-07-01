import { Effect, Layer, Option, Schema } from "effect"
import { SessionToken } from "@auth/application/models/session"
import { Auth } from "@auth/component"
import {
  UnauthenticatedGymAdministratorError,
  UnauthorizedGymAdministratorError,
} from "@gym/application/errors/gym"
import { GymAdministratorAuthorization } from "@gym/application/services/gym-administrator-authorization"

export const GymAdministratorAuthorizationAuth = Layer.effect(
  GymAdministratorAuthorization,
  Effect.gen(function* () {
    const auth = yield* Auth

    return {
      authorize: Effect.fn("GymAdministratorAuthorization.authorize")(
        function* (token: string) {
          const currentUser = yield* Schema.decodeUnknownEffect(SessionToken)(
            token
          ).pipe(
            Effect.flatMap((parsedToken) =>
              auth.getCurrentUser({ token: parsedToken })
            ),
            Effect.mapError(
              () => new UnauthenticatedGymAdministratorError()
            )
          )

          if (Option.isNone(currentUser)) {
            return yield* new UnauthenticatedGymAdministratorError()
          }

          if (currentUser.value.role !== "admin") {
            return yield* new UnauthorizedGymAdministratorError()
          }
        }
      ),
    }
  })
)
