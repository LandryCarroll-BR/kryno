import crypto from "node:crypto"
import { Effect, Layer } from "effect"
import { GymRouteId } from "@gym/application/models/gym-route"
import { GymRouteIdService } from "@gym/application/services/gym-route-id"

export const GymRouteIdServiceLive = Layer.succeed(GymRouteIdService, {
  generate: Effect.fn("GymRouteIdService.generate")(function* () {
    return GymRouteId.make(crypto.randomBytes(18).toString("base64url"))
  }),
})
