import { Effect, Layer, Schema, Option } from "effect"
import { Service } from "effect/Context"

import type { SessionWithToken } from "../models/session.models"
import { CreateSessionFactory } from "../factories/create-session.factory"
import { User } from "../models/user.models"
import { UserRepository } from "../repositories/user.repository"
import { UserService } from "../services/user.service"

import {
  UserEmailAlreadyExistsError,
  UsernameAlreadyExistsError,
} from "../errors/user.errors"

export const SignUpInputSchema = Schema.Struct({
  email: Schema.NonEmptyString,
  username: Schema.NonEmptyString,
  password: Schema.NonEmptyString,
}).annotate({ identifier: "SignUpInput" })

export type SignUpInput = typeof SignUpInputSchema.Type

export class SignUpUseCase extends Service<
  SignUpUseCase,
  {
    readonly execute: (
      input: SignUpInput
    ) => Effect.Effect<
      SessionWithToken,
      UserEmailAlreadyExistsError | UsernameAlreadyExistsError
    >
  }
>()("@auth/application/SignUpUseCase") {
  static Live = Layer.effect(
    SignUpUseCase,
    Effect.gen(function* () {
      const userRepository = yield* UserRepository
      const userService = yield* UserService
      const createSession = yield* CreateSessionFactory

      return {
        execute: Effect.fn("SignUpUseCase.execute")(function* (input) {
          // Check if the username already exists
          const existingUser = yield* userRepository.findByUsername(
            input.username
          )
          if (Option.isSome(existingUser)) {
            return yield* new UsernameAlreadyExistsError({
              username: input.username,
            })
          }

          // Check if the email already exists
          const existingEmail = yield* userRepository.findByEmail(input.email)
          if (Option.isSome(existingEmail)) {
            return yield* new UserEmailAlreadyExistsError({
              email: input.email,
            })
          }

          // Generate a secure random string to use as the user ID
          const userId = yield* userService.generateUserId()

          // Hash the password before storing it in the database
          const passwordHash = yield* userService.hashPassword(input.password)

          // Create a new user object and save it to the database
          const newUser = User.make({
            id: userId,
            username: input.username,
            email: input.email,
            passwordHash: passwordHash,
            createdAt: new Date(),
          })
          const user = yield* userRepository.createUser(newUser)

          // Create a new session for the user and return the session cookie
          return yield* createSession({ userId: user.id })
        }),
      }
    })
  )
}
