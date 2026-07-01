import { Effect, Layer } from "effect"
import { UnauthenticatedGymMemberError } from "@gym/application/errors/gym-membership"
import { GymMemberId } from "@gym/application/models/gym-membership"
import { AuthenticatedGymMember } from "@gym/application/services/authenticated-gym-member"

export const AuthenticatedGymMemberTest = Layer.succeed(
  AuthenticatedGymMember,
  {
    resolve: Effect.fn("AuthenticatedGymMember.resolve")(function* (token) {
      if (token === "admin-token") {
        return GymMemberId.make("admin-member")
      }

      if (token === "user-token") {
        return GymMemberId.make("member-1")
      }

      if (token === "other-user-token") {
        return GymMemberId.make("member-2")
      }

      return yield* new UnauthenticatedGymMemberError()
    }),
  }
)
