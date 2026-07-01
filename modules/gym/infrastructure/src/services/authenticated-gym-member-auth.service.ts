import { Effect, Layer, Option, Schema } from "effect"
import { SessionToken } from "@auth/application/models/session"
import { Auth } from "@auth/component"
import { UnauthenticatedGymMemberError } from "@gym/application/errors/gym-membership"
import { GymMemberId } from "@gym/application/models/gym-membership"
import { AuthenticatedGymMember } from "@gym/application/services/authenticated-gym-member"

export const AuthenticatedGymMemberAuth = Layer.effect(
  AuthenticatedGymMember,
  Effect.gen(function* () {
    const auth = yield* Auth

    return {
      resolve: Effect.fn("AuthenticatedGymMember.resolve")(function* (
        token: string
      ) {
        const currentUser = yield* Schema.decodeUnknownEffect(SessionToken)(
          token
        ).pipe(
          Effect.flatMap((parsedToken) =>
            auth.getCurrentUser({ token: parsedToken })
          ),
          Effect.mapError(() => new UnauthenticatedGymMemberError())
        )

        return yield* Option.match(currentUser, {
          onNone: () => Effect.fail(new UnauthenticatedGymMemberError()),
          onSome: (user) => Effect.succeed(GymMemberId.make(user.id)),
        })
      }),
    }
  })
)
