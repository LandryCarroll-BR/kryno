import { DateTime, Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import { SavedBoulderNotFoundError } from "../errors/boulder.errors"
import type { UnauthenticatedClimberError } from "../errors/climber.errors"
import { NoActiveClimbingSessionError } from "../errors/climbing-session.errors"
import { BoulderId } from "../models/boulder.models"
import {
  ClimbingAttempt,
  ClimbingAttemptOutcome,
} from "../models/climbing-attempt.models"
import { BoulderRepository } from "../repositories/boulder.repository"
import { ClimbingSessionRepository } from "../repositories/climbing-session.repository"
import { AuthenticatedClimber } from "../services/authenticated-climber.service"
import { ClimbingAttemptIdService } from "../services/climbing-attempt-id.service"

export const LogBoulderAttemptInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
  boulderId: BoulderId,
  outcome: ClimbingAttemptOutcome,
}).annotate({ identifier: "LogBoulderAttemptInput" })

export type LogBoulderAttemptInput = typeof LogBoulderAttemptInputSchema.Type

export class LogBoulderAttemptUseCase extends Service<
  LogBoulderAttemptUseCase,
  {
    readonly execute: (
      input: LogBoulderAttemptInput
    ) => Effect.Effect<
      ClimbingAttempt,
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
      const attemptIdService = yield* ClimbingAttemptIdService
      const boulderRepository = yield* BoulderRepository
      const sessionRepository = yield* ClimbingSessionRepository

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

            const id = yield* attemptIdService.generate()
            const occurredAt = yield* DateTime.nowAsDate
            const loggedAttempt =
              yield* sessionRepository.insertAttemptIntoActiveSession({
                climberId,
                id,
                boulderId: parsedInput.boulderId,
                outcome: parsedInput.outcome,
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
