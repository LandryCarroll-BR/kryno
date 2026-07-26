import { Effect, Layer, Option, Ref } from "effect"
import {
  AttemptOrdinal,
  ClimbingAttempt,
  ClimbingAttemptId,
} from "@climbing/application/models/climbing-attempt"
import { ClimbingSessionId } from "@climbing/application/models/climbing-session"
import { NoActiveGymClimbingSessionError } from "@gym/application/errors/gym-climbing"
import { GymBoulderAttempts } from "@gym/application/services/gym-boulder-attempts"

export const GymBoulderAttemptsTest = Layer.effect(
  GymBoulderAttempts,
  Effect.gen(function* () {
    const counter = yield* Ref.make(0)

    return {
      listForBoulders: Effect.fn("GymBoulderAttempts.listForBoulders")(
        function* ({ boulderIds }) {
          return boulderIds.map((boulderId, index) => ({
            boulderId,
            sessions: [
              {
                id: ClimbingSessionId.make(`gym-session-${index + 1}`),
                startedAt: new Date((index + 1) * 10_000),
                endedAt: Option.none(),
                attempts: [
                  ClimbingAttempt.make({
                    id: ClimbingAttemptId.make(
                      `gym-history-attempt-${index + 1}`
                    ),
                    boulderId,
                    ordinal: AttemptOrdinal.make(1),
                    outcome: index % 2 === 0 ? "TOPPED" : "FELL",
                    occurredAt: new Date((index + 1) * 10_000 + 1_000),
                  }),
                ],
              },
            ],
          }))
        }
      ),
      log: Effect.fn("GymBoulderAttempts.log")(function* ({
        token,
        memberId,
        boulderId,
        outcome,
      }) {
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
      }),
    }
  })
)
