import { Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import type { UnauthenticatedClimberError } from "../errors/climber.errors"
import {
  ActiveClimbingSessionCannotBeDeletedError,
  PastClimbingSessionNotFoundError,
} from "../errors/climbing-session.errors"
import {
  ClimbingSessionId,
  type CompletedClimbingSession,
} from "../models/climbing-session.models"
import { ClimbingSessionRepository } from "../repositories/climbing-session.repository"
import { AuthenticatedClimber } from "../services/authenticated-climber.service"
import { ClimbingAttemptVideoStorage } from "../services/climbing-attempt-video-storage.service"

export const DeleteClimbingSessionInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
  climbingSessionId: ClimbingSessionId,
}).annotate({ identifier: "DeleteClimbingSessionInput" })

export type DeleteClimbingSessionInput =
  typeof DeleteClimbingSessionInputSchema.Type
export type DeleteClimbingSessionOutput = CompletedClimbingSession

export class DeleteClimbingSessionUseCase extends Service<
  DeleteClimbingSessionUseCase,
  {
    readonly execute: (
      input: DeleteClimbingSessionInput
    ) => Effect.Effect<
      DeleteClimbingSessionOutput,
      | SchemaError
      | UnauthenticatedClimberError
      | PastClimbingSessionNotFoundError
      | ActiveClimbingSessionCannotBeDeletedError
    >
  }
>()("@climbing/application/DeleteClimbingSessionUseCase") {
  static Live = Layer.effect(
    DeleteClimbingSessionUseCase,
    Effect.gen(function* () {
      const authenticatedClimber = yield* AuthenticatedClimber
      const sessionRepository = yield* ClimbingSessionRepository
      const videoStorage = yield* ClimbingAttemptVideoStorage

      return {
        execute: Effect.fn("DeleteClimbingSessionUseCase.execute")(
          function* (input) {
            const parsedInput = yield* Schema.decodeUnknownEffect(
              DeleteClimbingSessionInputSchema
            )(input, { errors: "all" })

            const climberId = yield* authenticatedClimber.resolve(
              parsedInput.token
            )
            const activeSession =
              yield* sessionRepository.findActiveByClimberId(climberId)

            if (
              Option.isSome(activeSession) &&
              activeSession.value.id === parsedInput.climbingSessionId
            ) {
              return yield* new ActiveClimbingSessionCannotBeDeletedError({
                climberId,
                climbingSessionId: parsedInput.climbingSessionId,
              })
            }

            const deletedSession =
              yield* sessionRepository.deleteCompletedByClimberId(
                climberId,
                parsedInput.climbingSessionId
              )

            if (Option.isNone(deletedSession)) {
              return yield* new PastClimbingSessionNotFoundError({
                climberId,
                climbingSessionId: parsedInput.climbingSessionId,
              })
            }

            for (const attempt of deletedSession.value.attempts) {
              if (Option.isSome(attempt.videoUrl)) {
                yield* videoStorage
                  .delete(attempt.videoUrl.value)
                  .pipe(Effect.catchDefect(() => Effect.void))
              }
            }

            return deletedSession.value
          }
        ),
      }
    })
  )
}
