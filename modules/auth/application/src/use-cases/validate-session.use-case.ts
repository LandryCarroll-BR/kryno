import { Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import {
  InvalidSessionTokenError,
  SessionNotFoundError,
  InvalidSessionSecretHashError,
} from "../errors/session.errors"

import { Session, SessionToken } from "../models/session.models"
import { ValidateSessionFactory } from "../factories/validate-session.factory"

export const ValidateSessionInputSchema = Schema.Struct({
  token: SessionToken,
}).annotate({ identifier: "ValidateSessionInput" })

export type ValidateSessionInput = typeof ValidateSessionInputSchema.Type

export class ValidateSessionUseCase extends Service<
  ValidateSessionUseCase,
  {
    readonly execute: (
      input: ValidateSessionInput
    ) => Effect.Effect<
      Option.Option<Session>,
      | SchemaError
      | SessionNotFoundError
      | InvalidSessionTokenError
      | InvalidSessionSecretHashError
    >
  }
>()("@auth/application/ValidateSessionUseCase") {
  static Live = Layer.effect(
    ValidateSessionUseCase,
    Effect.gen(function* () {
      const validateSession = yield* ValidateSessionFactory

      return {
        execute: Effect.fn("ValidateSessionUseCase.execute")(function* (input) {
          const parsedInput = yield* Schema.decodeUnknownEffect(
            ValidateSessionInputSchema
          )(input, { errors: "all" })

          return yield* validateSession(parsedInput)
        }),
      }
    })
  )
}
