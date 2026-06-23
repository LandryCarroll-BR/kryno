import { DateTime, Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import type { UnauthenticatedClimberError } from "../errors/climber.errors"
import { NoActiveClimbingSessionError } from "../errors/climbing-session.errors"
import type { CompletedClimbingSession } from "../models/climbing-session.models"
import { ClimbingSessionRepository } from "../repositories/climbing-session.repository"
import { AuthenticatedClimber } from "../services/authenticated-climber.service"

export const EndClimbingSessionInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
}).annotate({ identifier: "EndClimbingSessionInput" })

export type EndClimbingSessionInput = typeof EndClimbingSessionInputSchema.Type

export class EndClimbingSessionUseCase extends Service<
  EndClimbingSessionUseCase,
  {
    readonly execute: (
      input: EndClimbingSessionInput
    ) => Effect.Effect<
      CompletedClimbingSession,
      SchemaError | UnauthenticatedClimberError | NoActiveClimbingSessionError
    >
  }
>()("@climbing/application/EndClimbingSessionUseCase") {
  static Live = Layer.effect(
    EndClimbingSessionUseCase,
    Effect.gen(function* () {
      const authenticatedClimber = yield* AuthenticatedClimber
      const sessionRepository = yield* ClimbingSessionRepository

      return {
        execute: Effect.fn("EndClimbingSessionUseCase.execute")(
          function* (input) {
            const parsedInput = yield* Schema.decodeUnknownEffect(
              EndClimbingSessionInputSchema
            )(input, { errors: "all" })

            const climberId = yield* authenticatedClimber.resolve(
              parsedInput.token
            )
            const endedAt = yield* DateTime.nowAsDate
            const endedSession = yield* sessionRepository.endActiveByClimberId(
              climberId,
              endedAt
            )

            return yield* Option.match(endedSession, {
              onNone: () =>
                Effect.fail(new NoActiveClimbingSessionError({ climberId })),
              onSome: Effect.succeed,
            })
          }
        ),
      }
    })
  )
}
