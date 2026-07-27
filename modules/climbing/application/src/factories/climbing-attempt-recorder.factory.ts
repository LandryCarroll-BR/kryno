import { DateTime, Effect, Layer, Option } from "effect"
import { Service } from "effect/Context"

import { NoActiveClimbingSessionError } from "../errors/climbing-session.errors"
import type { BoulderId } from "../models/boulder.models"
import {
  ClimbingAttempt,
  type ClimbingAttemptMoveType,
  type ClimbingAttemptOutcome,
  type ClimbingAttemptVideoUpload,
} from "../models/climbing-attempt.models"
import type { ClimberId } from "../models/climber.models"
import { ClimbingSessionRepository } from "../repositories/climbing-session.repository"
import { ClimbingAttemptIdService } from "../services/climbing-attempt-id.service"
import { ClimbingAttemptVideoStorage } from "../services/climbing-attempt-video-storage.service"

export type RecordClimbingAttemptInput = {
  readonly climberId: ClimberId
  readonly boulderId: BoulderId
  readonly outcome: ClimbingAttemptOutcome
  readonly moveTypes: readonly ClimbingAttemptMoveType[]
  readonly video?: ClimbingAttemptVideoUpload
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
      const videoStorage = yield* ClimbingAttemptVideoStorage

      return {
        record: Effect.fn("ClimbingAttemptRecorder.record")(
          function* ({ climberId, boulderId, outcome, moveTypes, video }) {
            const activeSession =
              yield* sessionRepository.findActiveByClimberId(climberId)

            if (Option.isNone(activeSession)) {
              return yield* new NoActiveClimbingSessionError({ climberId })
            }

            const id = yield* attemptIdService.generate()
            const occurredAt = yield* DateTime.nowAsDate
            const videoUrl =
              video === undefined
                ? Option.none()
                : Option.some(
                    yield* videoStorage.store({ attemptId: id, video })
                  )
            const loggedAttempt =
              yield* sessionRepository.insertAttemptIntoActiveSession({
                climberId,
                id,
                boulderId,
                outcome,
                moveTypes,
                occurredAt,
                videoUrl,
              })

            return yield* Option.match(loggedAttempt, {
              onNone: () =>
                Effect.gen(function* () {
                  if (Option.isSome(videoUrl)) {
                    yield* videoStorage
                      .delete(videoUrl.value)
                      .pipe(Effect.catchDefect(() => Effect.void))
                  }

                  return yield* new NoActiveClimbingSessionError({
                    climberId,
                  })
                }),
              onSome: (attempt) =>
                Effect.succeed(ClimbingAttempt.make(attempt)),
            })
          }
        ),
      }
    })
  )
}
