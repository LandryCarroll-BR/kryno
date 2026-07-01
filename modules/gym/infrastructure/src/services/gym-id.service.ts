import crypto from "node:crypto"
import { Effect, Layer } from "effect"
import { GymId } from "@gym/application/models/gym"
import { GymIdService } from "@gym/application/services/gym-id"

export const GymIdServiceLive = Layer.succeed(GymIdService, {
  generate: Effect.fn("GymIdService.generate")(function* () {
    return GymId.make(crypto.randomBytes(18).toString("base64url"))
  }),
})
