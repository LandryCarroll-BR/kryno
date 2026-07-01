import crypto from "node:crypto"
import { Effect, Layer } from "effect"
import { GymAreaId } from "@gym/application/models/gym-area"
import { GymAreaIdService } from "@gym/application/services/gym-area-id"

export const GymAreaIdServiceLive = Layer.succeed(GymAreaIdService, {
  generate: Effect.fn("GymAreaIdService.generate")(function* () {
    return GymAreaId.make(crypto.randomBytes(18).toString("base64url"))
  }),
})
