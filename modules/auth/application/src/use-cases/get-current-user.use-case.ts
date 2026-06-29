import { Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import { SessionToken } from "../models/session.models"
import { CurrentUser } from "../models/user.models"
import { UserRepository } from "../repositories/user.repository"
import { ValidateSessionFactory } from "../factories/validate-session.factory"

import type {
  InvalidSessionSecretHashError,
  InvalidSessionTokenError,
  SessionNotFoundError,
} from "../errors/session.errors"

export const GetCurrentUserInputSchema = Schema.Struct({
  token: SessionToken,
}).annotate({ identifier: "GetCurrentUserInput" })

export type GetCurrentUserInput = typeof GetCurrentUserInputSchema.Type
export type GetCurrentUserOutput = Option.Option<CurrentUser>

export class GetCurrentUserUseCase extends Service<
  GetCurrentUserUseCase,
  {
    readonly execute: (
      input: GetCurrentUserInput
    ) => Effect.Effect<
      GetCurrentUserOutput,
      | SchemaError
      | InvalidSessionSecretHashError
      | InvalidSessionTokenError
      | SessionNotFoundError
    >
  }
>()("@auth/application/GetCurrentUserUseCase") {
  static Live = Layer.effect(
    GetCurrentUserUseCase,
    Effect.gen(function* () {
      const validateSession = yield* ValidateSessionFactory
      const userRepository = yield* UserRepository

      return {
        execute: Effect.fn("GetCurrentUserUseCase.execute")(function* (input) {
          const parsedInput = yield* Schema.decodeUnknownEffect(
            GetCurrentUserInputSchema
          )(input, { errors: "all" })

          const session = yield* validateSession(parsedInput)

          if (Option.isNone(session)) {
            return Option.none()
          }

          const user = yield* userRepository.findById(session.value.userId)

          return Option.map(
            user,
            (user) =>
              new CurrentUser({
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                role: user.role,
              })
          )
        }),
      }
    })
  )
}
