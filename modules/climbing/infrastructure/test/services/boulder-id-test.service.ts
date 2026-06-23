import { BoulderId, BoulderIdService } from "@climbing/application"
import { Effect, Layer } from "effect"

export const BoulderIdServiceTest = Layer.succeed(BoulderIdService, {
  generate: () => Effect.succeed(BoulderId.make("boulder-1")),
})
