import { Effect, Layer, Ref } from "effect"
import { GymRouteId } from "@gym/application/models/gym-route"
import { GymRouteIdService } from "@gym/application/services/gym-route-id"

export const GymRouteIdServiceTest = Layer.effect(
  GymRouteIdService,
  Effect.gen(function* () {
    const counter = yield* Ref.make(1)

    return {
      generate: () =>
        Ref.getAndUpdate(counter, (value) => value + 1).pipe(
          Effect.map((value) => GymRouteId.make(`route-${value}`))
        ),
    }
  })
)
