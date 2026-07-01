import { Effect, Layer, Ref } from "effect"
import { GymId } from "@gym/application/models/gym"
import { GymIdService } from "@gym/application/services/gym-id"

export const GymIdServiceTest = Layer.effect(
  GymIdService,
  Effect.gen(function* () {
    const counter = yield* Ref.make(1)

    return {
      generate: () =>
        Ref.getAndUpdate(counter, (value) => value + 1).pipe(
          Effect.map((value) => GymId.make(`gym-${value}`))
        ),
    }
  })
)
