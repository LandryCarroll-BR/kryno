import { Effect, Layer, Option, Schema } from "effect"
import { SessionToken } from "@auth/application/models/session"
import { Auth } from "@auth/component"
import {
  UnauthenticatedGymCreatorError,
  UnauthorizedGymCreatorError,
} from "@gym/application/errors/gym"

import { GymCreatorAuthorization } from "@gym/application/services/gym-creator-authorization"

export const GymCreatorAuthorizationAuth = Layer.effect(
  GymCreatorAuthorization,
  Effect.gen(function* () {
    const auth = yield* Auth

    return {
      authorize: Effect.fn("GymCreatorAuthorization.authorize")(function* (
        token: string
      ) {
        const currentUser = yield* Schema.decodeUnknownEffect(SessionToken)(
          token
        ).pipe(
          Effect.flatMap((parsedToken) =>
            auth.getCurrentUser({ token: parsedToken })
          ),
          Effect.mapError(() => new UnauthenticatedGymCreatorError())
        )

        if (Option.isNone(currentUser)) {
          return yield* new UnauthenticatedGymCreatorError()
        }

        if (currentUser.value.role !== "admin") {
          return yield* new UnauthorizedGymCreatorError()
        }
      }),
    }
  })
)
