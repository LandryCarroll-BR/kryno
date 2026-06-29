import crypto from "node:crypto"
import { Effect, Layer } from "effect"
import { BoulderId } from "@climbing/application/models/boulder"
import { BoulderIdService } from "@climbing/application/services/boulder-id"

export const BoulderIdServiceLive = Layer.succeed(BoulderIdService, {
  generate: Effect.fn("BoulderIdService.generate")(function* () {
    return BoulderId.make(crypto.randomBytes(18).toString("base64url"))
  }),
})
