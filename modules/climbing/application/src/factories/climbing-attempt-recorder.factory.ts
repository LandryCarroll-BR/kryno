import { DateTime, Effect, Layer, Option } from "effect"
import { Service } from "effect/Context"

import { NoActiveClimbingSessionError } from "../errors/climbing-session.errors"
import type { BoulderId } from "../models/boulder.models"
import {
  ClimbingAttempt,
  type ClimbingAttemptMoveType,
  type ClimbingAttemptOutcome,
} from "../models/climbing-attempt.models"
import type { ClimberId } from "../models/climber.models"
import { ClimbingSessionRepository } from "../repositories/climbing-session.repository"
import { ClimbingAttemptIdService } from "../services/climbing-attempt-id.service"

export type RecordClimbingAttemptInput = {
  readonly climberId: ClimberId
  readonly boulderId: BoulderId
  readonly outcome: ClimbingAttemptOutcome
  readonly moveTypes: readonly ClimbingAttemptMoveType[]
}

export class ClimbingAttemptRecorder extends Service<
  ClimbingAttemptRecorder,
  {
    readonly record: (
      input: RecordClimbingAttemptInput
    ) => Effect.Effect<ClimbingAttempt, NoActiveClimbingSessionError>
  }
>()("@climbing/application/ClimbingAttemptRecorder") {
  static Live = Layer.effect(
    ClimbingAttemptRecorder,
    Effect.gen(function* () {
      const attemptIdService = yield* ClimbingAttemptIdService
      const sessionRepository = yield* ClimbingSessionRepository

      return {
        record: Effect.fn("ClimbingAttemptRecorder.record")(
          function* ({ climberId, boulderId, outcome, moveTypes }) {
            const id = yield* attemptIdService.generate()
            const occurredAt = yield* DateTime.nowAsDate
            const loggedAttempt =
              yield* sessionRepository.insertAttemptIntoActiveSession({
                climberId,
                id,
                boulderId,
                outcome,
                moveTypes,
                occurredAt,
              })

            return yield* Option.match(loggedAttempt, {
              onNone: () =>
                Effect.fail(new NoActiveClimbingSessionError({ climberId })),
              onSome: (attempt) =>
                Effect.succeed(ClimbingAttempt.make(attempt)),
            })
          }
        ),
      }
    })
  )
}
