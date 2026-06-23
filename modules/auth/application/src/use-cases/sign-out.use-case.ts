import { Layer, Effect, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import { SessionToken } from "../models/session.models"
import { SessionRepository } from "../repositories/session.repository"
import { ValidateSessionFactory } from "../factories/validate-session.factory"

import type {
  InvalidSessionSecretHashError,
  InvalidSessionTokenError,
  SessionNotFoundError,
} from "../errors/session.errors"

export const SignOutInputSchema = Schema.Struct({
  token: SessionToken,
}).annotate({ identifier: "SignOutInput" })

export type SignOutInput = typeof SignOutInputSchema.Type

export class SignOutUseCase extends Service<
  SignOutUseCase,
  {
    readonly execute: (
      input: SignOutInput
    ) => Effect.Effect<
      void,
      | SchemaError
      | InvalidSessionSecretHashError
      | InvalidSessionTokenError
      | SessionNotFoundError
    >
  }
>()("@auth/application/SignOutUseCase") {
  static Live = Layer.effect(
    SignOutUseCase,
    Effect.gen(function* () {
      const sessionRepository = yield* SessionRepository
      const validateSession = yield* ValidateSessionFactory

      return {
        execute: Effect.fn("SignOutUseCase.execute")(
          function* (input) {
            const parsedInput = yield* Schema.decodeUnknownEffect(
              SignOutInputSchema
            )(input, { errors: "all" })

            const session = yield* validateSession(parsedInput)

            if (Option.isNone(session)) {
              return yield* Effect.void
            }

            yield* sessionRepository.delete(session.value.id)
          },
          Effect.catchTags({
            SchemaError: () => Effect.void,
            InvalidSessionSecretHashError: () => Effect.void,
            InvalidSessionTokenError: () => Effect.void,
            SessionNotFoundError: () => Effect.void,
          })
        ),
      }
    })
  )
}
