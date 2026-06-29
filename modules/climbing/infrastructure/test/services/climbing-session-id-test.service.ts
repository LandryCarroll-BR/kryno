import { ClimbingSessionId } from "@climbing/application/models/climbing-session"
import { ClimbingSessionIdService } from "@climbing/application/services/climbing-session-id"
import { Effect, Layer } from "effect"

export const ClimbingSessionIdServiceTest = Layer.succeed(
  ClimbingSessionIdService,
  {
    generate: () =>
      Effect.succeed(ClimbingSessionId.make("climbing-session-1")),
  }
)
