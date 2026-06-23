import { Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import type { UnauthenticatedClimberError } from "../errors/climber.errors"
import type { ActiveClimbingSession } from "../models/climbing-session.models"
import { ClimbingSessionRepository } from "../repositories/climbing-session.repository"
import { AuthenticatedClimber } from "../services/authenticated-climber.service"

export const GetCurrentClimbingSessionInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
}).annotate({ identifier: "GetCurrentClimbingSessionInput" })

export type GetCurrentClimbingSessionInput =
  typeof GetCurrentClimbingSessionInputSchema.Type

export class GetCurrentClimbingSessionUseCase extends Service<
  GetCurrentClimbingSessionUseCase,
  {
    readonly execute: (
      input: GetCurrentClimbingSessionInput
    ) => Effect.Effect<
      Option.Option<ActiveClimbingSession>,
      SchemaError | UnauthenticatedClimberError
    >
  }
>()("@climbing/application/GetCurrentClimbingSessionUseCase") {
  static Live = Layer.effect(
    GetCurrentClimbingSessionUseCase,
    Effect.gen(function* () {
      const authenticatedClimber = yield* AuthenticatedClimber
      const sessionRepository = yield* ClimbingSessionRepository

      return {
        execute: Effect.fn("GetCurrentClimbingSessionUseCase.execute")(
          function* (input) {
            const parsedInput = yield* Schema.decodeUnknownEffect(
              GetCurrentClimbingSessionInputSchema
            )(input, { errors: "all" })

            const climberId = yield* authenticatedClimber.resolve(
              parsedInput.token
            )

            return yield* sessionRepository.findActiveByClimberId(climberId)
          }
        ),
      }
    })
  )
}
