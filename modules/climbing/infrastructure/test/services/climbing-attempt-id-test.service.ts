import { ClimbingAttemptId } from "@climbing/application/models/climbing-attempt"
import { ClimbingAttemptIdService } from "@climbing/application/services/climbing-attempt-id"
import { Effect, Layer, Ref } from "effect"

export const ClimbingAttemptIdServiceTest = Layer.effect(
  ClimbingAttemptIdService,
  Effect.gen(function* () {
    const counter = yield* Ref.make(1)

    return {
      generate: () =>
        Ref.getAndUpdate(counter, (value) => value + 1).pipe(
          Effect.map((value) => ClimbingAttemptId.make(`attempt-${value}`))
        ),
    }
  })
)
