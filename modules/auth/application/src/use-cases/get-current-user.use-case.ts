import { Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"

import type { User } from "../models/user.models"
import { ValidateSessionFactory } from "../factories/validate-session.factory"
import { UserRepository } from "../repositories/user.repository"

export const GetCurrentUserInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
}).annotate({ identifier: "GetCurrentUserInput" })

export type GetCurrentUserInput = typeof GetCurrentUserInputSchema.Type

export class GetCurrentUserUseCase extends Service<
  GetCurrentUserUseCase,
  {
    readonly execute: (
      input: GetCurrentUserInput
    ) => Effect.Effect<Option.Option<User>>
  }
>()("@auth/application/GetCurrentUserUseCase") {
  static Live = Layer.effect(
    GetCurrentUserUseCase,
    Effect.gen(function* () {
      const validateSession = yield* ValidateSessionFactory
      const userRepository = yield* UserRepository

      return {
        execute: Effect.fn("GetCurrentUserUseCase.execute")(
          function* (input) {
            const session = yield* validateSession(input)

            if (Option.isNone(session)) {
              return Option.none()
            }

            return yield* userRepository.findById(session.value.userId)
          },
          Effect.catchTags({
            InvalidSessionSecretHashError: () => Effect.succeed(Option.none()),
            InvalidSessionTokenError: () => Effect.succeed(Option.none()),
            SessionNotFoundError: () => Effect.succeed(Option.none()),
          })
        ),
      }
    })
  )
}
