import { Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import { SavedBoulderNotFoundError } from "../errors/boulder.errors"
import type { UnauthenticatedClimberError } from "../errors/climber.errors"
import type { NoActiveClimbingSessionError } from "../errors/climbing-session.errors"
import { ClimbingAttemptRecorder } from "../factories/climbing-attempt-recorder.factory"
import { BoulderId } from "../models/boulder.models"
import {
  type ClimbingAttempt,
  ClimbingAttemptMoveType,
  ClimbingAttemptOutcome,
} from "../models/climbing-attempt.models"
import { BoulderRepository } from "../repositories/boulder.repository"
import { AuthenticatedClimber } from "../services/authenticated-climber.service"

export const LogBoulderAttemptInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
  boulderId: BoulderId,
  outcome: ClimbingAttemptOutcome,
  moveTypes: Schema.Array(ClimbingAttemptMoveType),
}).annotate({ identifier: "LogBoulderAttemptInput" })

export type LogBoulderAttemptInput = typeof LogBoulderAttemptInputSchema.Type
export type LogBoulderAttemptOutput = ClimbingAttempt

export class LogBoulderAttemptUseCase extends Service<
  LogBoulderAttemptUseCase,
  {
    readonly execute: (
      input: LogBoulderAttemptInput
    ) => Effect.Effect<
      LogBoulderAttemptOutput,
      | SchemaError
      | UnauthenticatedClimberError
      | SavedBoulderNotFoundError
      | NoActiveClimbingSessionError
    >
  }
>()("@climbing/application/LogBoulderAttemptUseCase") {
  static Live = Layer.effect(
    LogBoulderAttemptUseCase,
    Effect.gen(function* () {
      const authenticatedClimber = yield* AuthenticatedClimber
      const boulderRepository = yield* BoulderRepository
      const attemptRecorder = yield* ClimbingAttemptRecorder

      return {
        execute: Effect.fn("LogBoulderAttemptUseCase.execute")(
          function* (input) {
            const parsedInput = yield* Schema.decodeUnknownEffect(
              LogBoulderAttemptInputSchema
            )(input, { errors: "all" })

            const climberId = yield* authenticatedClimber.resolve(
              parsedInput.token
            )
            const savedBoulder = yield* boulderRepository.findSavedById(
              climberId,
              parsedInput.boulderId
            )

            if (Option.isNone(savedBoulder)) {
              return yield* new SavedBoulderNotFoundError({
                climberId,
                boulderId: parsedInput.boulderId,
              })
            }

            return yield* attemptRecorder.record({
              climberId,
              boulderId: parsedInput.boulderId,
              outcome: parsedInput.outcome,
              moveTypes: parsedInput.moveTypes,
            })
          }
        ),
      }
    })
  )
}
