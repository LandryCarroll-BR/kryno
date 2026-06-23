import {
  AuthenticatedClimber,
  ClimberId,
  UnauthenticatedClimberError,
} from "@climbing/application"
import { Effect, Layer } from "effect"

export const AuthenticatedClimberTest = Layer.succeed(AuthenticatedClimber, {
  resolve: (token) =>
    token === "valid-token"
      ? Effect.succeed(ClimberId.make("climber-1"))
      : Effect.fail(new UnauthenticatedClimberError()),
})
