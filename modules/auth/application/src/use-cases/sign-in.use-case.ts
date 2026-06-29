import { Effect, Layer, Schema, Option } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import type { SessionWithToken } from "../models/session.models"
import { CreateSessionFactory } from "../factories/create-session.factory"
import { Email, Password } from "../models/user.models"
import { UserRepository } from "../repositories/user.repository"
import { UserService } from "../services/user.service"

import {
  UserEmailNotFoundError,
  UserPasswordInvalidError,
} from "../errors/user.errors"

export const SignInInputSchema = Schema.Struct({
  email: Email,
  password: Password,
}).annotate({ identifier: "SignInInput" })

export type SignInInput = typeof SignInInputSchema.Type
export type SignInOutput = SessionWithToken

export class SignInUseCase extends Service<
  SignInUseCase,
  {
    readonly execute: (
      input: SignInInput
    ) => Effect.Effect<
      SignInOutput,
      SchemaError | UserEmailNotFoundError | UserPasswordInvalidError
    >
  }
>()("@auth/application/SignInUseCase") {
  static Live = Layer.effect(
    SignInUseCase,
    Effect.gen(function* () {
      const userRepository = yield* UserRepository
      const userService = yield* UserService
      const createSession = yield* CreateSessionFactory

      return {
        execute: Effect.fn("SignInUseCase.execute")(function* (input) {
          const parsedInput = yield* Schema.decodeUnknownEffect(
            SignInInputSchema
          )(input, { errors: "all" })

          // Check if the email already exists
          const existingUser = yield* userRepository.findByEmail(
            parsedInput.email
          )
          if (Option.isNone(existingUser)) {
            return yield* new UserEmailNotFoundError({
              email: parsedInput.email,
            })
          }

          const validPassword = yield* userService.validatePasswords({
            password: parsedInput.password,
            passwordHash: existingUser.value.passwordHash,
          })

          if (!validPassword) {
            return yield* new UserPasswordInvalidError({
              email: parsedInput.email,
            })
          }

          return yield* createSession({
            userId: existingUser.value.id,
          })
        }),
      }
    })
  )
}
