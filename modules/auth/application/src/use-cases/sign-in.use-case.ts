import { Effect, Layer, Schema, Option } from "effect"
import { Service } from "effect/Context"

import type { SessionWithToken } from "../models/session.models"
import { CreateSessionFactory } from "../factories/create-session.factory"
import { UserRepository } from "../repositories/user.repository"
import { UserService } from "../services/user.service"

import {
  UserEmailNotFoundError,
  UserPasswordInvalidError,
} from "../errors/user.errors"

export const SignInInputSchema = Schema.Struct({
  email: Schema.NonEmptyString,
  password: Schema.NonEmptyString,
}).annotate({ identifier: "SignInInput" })

export type SignInInput = typeof SignInInputSchema.Type

export class SignInUseCase extends Service<
  SignInUseCase,
  {
    readonly execute: (
      input: SignInInput
    ) => Effect.Effect<
      SessionWithToken,
      UserEmailNotFoundError | UserPasswordInvalidError
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
          // Check if the email already exists
          const existingUser = yield* userRepository.findByEmail(input.email)
          if (Option.isNone(existingUser)) {
            return yield* new UserEmailNotFoundError({
              email: input.email,
            })
          }

          const validPassword = yield* userService.validatePasswords({
            password: input.password,
            passwordHash: existingUser.value.passwordHash,
          })

          if (!validPassword) {
            return yield* new UserPasswordInvalidError({
              email: input.email,
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
