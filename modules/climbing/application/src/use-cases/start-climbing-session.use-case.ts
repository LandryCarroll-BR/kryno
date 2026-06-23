import { DateTime, Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import type { UnauthenticatedClimberError } from "../errors/climber.errors"
import { ActiveClimbingSession } from "../models/climbing-session.models"
import { ClimbingSessionRepository } from "../repositories/climbing-session.repository"
import { AuthenticatedClimber } from "../services/authenticated-climber.service"
import { ClimbingSessionIdService } from "../services/climbing-session-id.service"

export const StartClimbingSessionInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
}).annotate({ identifier: "StartClimbingSessionInput" })

export type StartClimbingSessionInput =
  typeof StartClimbingSessionInputSchema.Type

export class StartClimbingSessionUseCase extends Service<
  StartClimbingSessionUseCase,
  {
    readonly execute: (
      input: StartClimbingSessionInput
    ) => Effect.Effect<
      ActiveClimbingSession,
      SchemaError | UnauthenticatedClimberError
    >
  }
>()("@climbing/application/StartClimbingSessionUseCase") {
  static Live = Layer.effect(
    StartClimbingSessionUseCase,
    Effect.gen(function* () {
      const authenticatedClimber = yield* AuthenticatedClimber
      const sessionIdService = yield* ClimbingSessionIdService
      const sessionRepository = yield* ClimbingSessionRepository

      return {
        execute: Effect.fn("StartClimbingSessionUseCase.execute")(
          function* (input) {
            const parsedInput = yield* Schema.decodeUnknownEffect(
              StartClimbingSessionInputSchema
            )(input, { errors: "all" })

            const climberId = yield* authenticatedClimber.resolve(
              parsedInput.token
            )
            const existingSession =
              yield* sessionRepository.findActiveByClimberId(climberId)

            if (Option.isSome(existingSession)) {
              return existingSession.value
            }

            const id = yield* sessionIdService.generate()
            const startedAt = yield* DateTime.nowAsDate

            return yield* sessionRepository.createActive(
              ActiveClimbingSession.make({
                id,
                climberId,
                attempts: [],
                startedAt,
              })
            )
          }
        ),
      }
    })
  )
}
