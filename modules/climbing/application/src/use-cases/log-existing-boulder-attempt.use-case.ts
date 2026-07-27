import { Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import { BoulderNotFoundError } from "../errors/boulder.errors"
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

export const LogExistingBoulderAttemptInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
  boulderId: BoulderId,
  outcome: ClimbingAttemptOutcome,
  moveTypes: Schema.Array(ClimbingAttemptMoveType),
}).annotate({ identifier: "LogExistingBoulderAttemptInput" })

export type LogExistingBoulderAttemptInput =
  typeof LogExistingBoulderAttemptInputSchema.Type
export type LogExistingBoulderAttemptOutput = ClimbingAttempt

export class LogExistingBoulderAttemptUseCase extends Service<
  LogExistingBoulderAttemptUseCase,
  {
    readonly execute: (
      input: LogExistingBoulderAttemptInput
    ) => Effect.Effect<
      LogExistingBoulderAttemptOutput,
      | SchemaError
      | UnauthenticatedClimberError
      | BoulderNotFoundError
      | NoActiveClimbingSessionError
    >
  }
>()("@climbing/application/LogExistingBoulderAttemptUseCase") {
  static Live = Layer.effect(
    LogExistingBoulderAttemptUseCase,
    Effect.gen(function* () {
      const authenticatedClimber = yield* AuthenticatedClimber
      const boulderRepository = yield* BoulderRepository
      const attemptRecorder = yield* ClimbingAttemptRecorder

      return {
        execute: Effect.fn("LogExistingBoulderAttemptUseCase.execute")(
          function* (input) {
            const parsedInput = yield* Schema.decodeUnknownEffect(
              LogExistingBoulderAttemptInputSchema
            )(input, { errors: "all" })
            const climberId = yield* authenticatedClimber.resolve(
              parsedInput.token
            )
            const boulder = yield* boulderRepository.findById(
              parsedInput.boulderId
            )

            if (Option.isNone(boulder)) {
              return yield* new BoulderNotFoundError({
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
