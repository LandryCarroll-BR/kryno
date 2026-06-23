import {
  ClimbingSessionId,
  ClimbingSessionIdService,
} from "@climbing/application"
import { Effect, Layer } from "effect"

export const ClimbingSessionIdServiceTest = Layer.succeed(
  ClimbingSessionIdService,
  {
    generate: () =>
      Effect.succeed(ClimbingSessionId.make("climbing-session-1")),
  }
)
