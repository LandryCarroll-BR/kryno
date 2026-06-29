import crypto from "node:crypto"
import { Effect, Layer } from "effect"
import { ClimbingAttemptId } from "@climbing/application/models/climbing-attempt"
import { ClimbingAttemptIdService } from "@climbing/application/services/climbing-attempt-id"

export const ClimbingAttemptIdServiceLive = Layer.succeed(
  ClimbingAttemptIdService,
  {
    generate: Effect.fn("ClimbingAttemptIdService.generate")(function* () {
      return ClimbingAttemptId.make(
        crypto.randomBytes(18).toString("base64url")
      )
    }),
  }
)
