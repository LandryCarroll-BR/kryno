import { ClimbingSessionId } from "@climbing/application/models/climbing-session"
import { ClimbingSessionIdService } from "@climbing/application/services/climbing-session-id"
import { Effect, Layer, Ref } from "effect"

export const ClimbingSessionIdServiceTest = Layer.effect(
  ClimbingSessionIdService,
  Effect.gen(function* () {
    const counter = yield* Ref.make(1)

    return {
      generate: () =>
        Ref.getAndUpdate(counter, (value) => value + 1).pipe(
          Effect.map((value) =>
            ClimbingSessionId.make(`climbing-session-${value}`)
          )
        ),
    }
  })
)
