import crypto from "node:crypto"
import { Effect, Layer } from "effect"
import {
  ClimbingAttemptId,
  ClimbingAttemptIdService,
} from "@climbing/application"

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
