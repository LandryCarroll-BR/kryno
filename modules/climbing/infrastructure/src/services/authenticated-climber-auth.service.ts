import { Effect, Layer, Option, Schema } from "effect"
import { Auth } from "@auth/component"
import { SessionToken } from "@auth/application/models/session"
import { UnauthenticatedClimberError } from "@climbing/application/errors/climber"
import { ClimberId } from "@climbing/application/models/climber"
import { AuthenticatedClimber } from "@climbing/application/services/authenticated-climber"

export const AuthenticatedClimberAuth = Layer.effect(
  AuthenticatedClimber,
  Effect.gen(function* () {
    const auth = yield* Auth

    return {
      resolve: Effect.fn("AuthenticatedClimber.resolve")(function* (
        token: string
      ) {
        const currentUser = yield* Schema.decodeUnknownEffect(SessionToken)(
          token
        ).pipe(
          Effect.flatMap((parsedToken) =>
            auth.getCurrentUser({ token: parsedToken })
          ),
          Effect.mapError(() => new UnauthenticatedClimberError())
        )

        return yield* Option.match(currentUser, {
          onNone: () => Effect.fail(new UnauthenticatedClimberError()),
          onSome: (user) => Effect.succeed(ClimberId.make(user.id)),
        })
      }),
    }
  })
)
