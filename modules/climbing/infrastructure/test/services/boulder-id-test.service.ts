import { BoulderId } from "@climbing/application/models/boulder"
import { BoulderIdService } from "@climbing/application/services/boulder-id"
import { Effect, Layer, Ref } from "effect"

export const BoulderIdServiceTest = Layer.effect(
  BoulderIdService,
  Effect.gen(function* () {
    const counter = yield* Ref.make(1)

    return {
      generate: () =>
        Ref.getAndUpdate(counter, (value) => value + 1).pipe(
          Effect.map((value) => BoulderId.make(`boulder-${value}`))
        ),
    }
  })
)
