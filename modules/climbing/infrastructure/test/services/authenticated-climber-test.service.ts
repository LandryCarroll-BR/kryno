import { UnauthenticatedClimberError } from "@climbing/application/errors/climber"
import { ClimberId } from "@climbing/application/models/climber"
import { AuthenticatedClimber } from "@climbing/application/services/authenticated-climber"
import { Effect, Layer } from "effect"

export const AuthenticatedClimberTest = Layer.succeed(AuthenticatedClimber, {
  resolve: (token) => {
    if (token === "valid-token") {
      return Effect.succeed(ClimberId.make("climber-1"))
    }

    if (token === "other-valid-token") {
      return Effect.succeed(ClimberId.make("climber-2"))
    }

    return Effect.fail(new UnauthenticatedClimberError())
  },
})
