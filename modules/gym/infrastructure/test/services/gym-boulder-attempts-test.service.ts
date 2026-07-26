import { Effect, Layer, Ref } from "effect"
import {
  AttemptOrdinal,
  ClimbingAttempt,
  ClimbingAttemptId,
} from "@climbing/application/models/climbing-attempt"
import { NoActiveGymClimbingSessionError } from "@gym/application/errors/gym-climbing"
import { GymBoulderAttempts } from "@gym/application/services/gym-boulder-attempts"

export const GymBoulderAttemptsTest = Layer.effect(
  GymBoulderAttempts,
  Effect.gen(function* () {
    const counter = yield* Ref.make(0)

    return {
      log: Effect.fn("GymBoulderAttempts.log")(
        function* ({ token, memberId, boulderId, outcome }) {
          if (token === "other-user-token") {
            return yield* new NoActiveGymClimbingSessionError({ memberId })
          }

          const ordinal = yield* Ref.updateAndGet(counter, (value) => value + 1)

          return ClimbingAttempt.make({
            id: ClimbingAttemptId.make(`gym-attempt-${ordinal}`),
            boulderId,
            ordinal: AttemptOrdinal.make(ordinal),
            outcome,
            occurredAt: new Date(ordinal * 1_000),
          })
        }
      ),
    }
  })
)
