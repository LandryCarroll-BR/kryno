import crypto from "node:crypto"
import { Effect, Layer } from "effect"
import { BoulderId, BoulderIdService } from "@climbing/application"

export const BoulderIdServiceLive = Layer.succeed(BoulderIdService, {
  generate: Effect.fn("BoulderIdService.generate")(function* () {
    return BoulderId.make(crypto.randomBytes(18).toString("base64url"))
  }),
})
