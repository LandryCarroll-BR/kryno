import crypto from "node:crypto"
import { Effect, Layer } from "effect"
import { ClimbingSessionId } from "@climbing/application/models/climbing-session"
import { ClimbingSessionIdService } from "@climbing/application/services/climbing-session-id"

export const ClimbingSessionIdServiceLive = Layer.succeed(
  ClimbingSessionIdService,
  {
    generate: Effect.fn("ClimbingSessionIdService.generate")(function* () {
      return ClimbingSessionId.make(
        crypto.randomBytes(18).toString("base64url")
      )
    }),
  }
)
