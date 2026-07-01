import { Effect, Layer, Ref } from "effect"
import { GymAreaId } from "@gym/application/models/gym-area"
import { GymAreaIdService } from "@gym/application/services/gym-area-id"

export const GymAreaIdServiceTest = Layer.effect(
  GymAreaIdService,
  Effect.gen(function* () {
    const counter = yield* Ref.make(1)

    return {
      generate: () =>
        Ref.getAndUpdate(counter, (value) => value + 1).pipe(
          Effect.map((value) => GymAreaId.make(`area-${value}`))
        ),
    }
  })
)
