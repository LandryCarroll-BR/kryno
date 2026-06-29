import { BoulderId } from "@climbing/application/models/boulder"
import { BoulderIdService } from "@climbing/application/services/boulder-id"
import { Effect, Layer } from "effect"

export const BoulderIdServiceTest = Layer.succeed(BoulderIdService, {
  generate: () => Effect.succeed(BoulderId.make("boulder-1")),
})
