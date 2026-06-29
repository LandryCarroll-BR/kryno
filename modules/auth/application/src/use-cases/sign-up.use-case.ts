import { Effect, Layer, Schema, Option } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import type { SessionWithToken } from "../models/session.models"
import { CreateSessionFactory } from "../factories/create-session.factory"
import { Email, Password, User, Username } from "../models/user.models"
import { UserRepository } from "../repositories/user.repository"
import { UserService } from "../services/user.service"

import {
  UserEmailAlreadyExistsError,
  UsernameAlreadyExistsError,
} from "../errors/user.errors"

export const SignUpInputSchema = Schema.Struct({
  email: Email,
  username: Username,
  password: Password,
}).annotate({ identifier: "SignUpInput" })

export type SignUpInput = typeof SignUpInputSchema.Type
export type SignUpOutput = SessionWithToken

export class SignUpUseCase extends Service<
  SignUpUseCase,
  {
    readonly execute: (
      input: SignUpInput
    ) => Effect.Effect<
      SignUpOutput,
      | SchemaError
      | UserEmailAlreadyExistsError
      | UsernameAlreadyExistsError
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
          const parsedInput = yield* Schema.decodeUnknownEffect(
            SignUpInputSchema
          )(input, { errors: "all" })

          // Check if the username already exists
          const existingUser = yield* userRepository.findByUsername(
            parsedInput.username
          )
          if (Option.isSome(existingUser)) {
            return yield* new UsernameAlreadyExistsError({
              username: parsedInput.username,
            })
          }

          // Check if the email already exists
          const existingEmail = yield* userRepository.findByEmail(
            parsedInput.email
          )
          if (Option.isSome(existingEmail)) {
            return yield* new UserEmailAlreadyExistsError({
              email: parsedInput.email,
            })
          }

          // Generate a secure random string to use as the user ID
          const userId = yield* userService.generateUserId()

          // Hash the password before storing it in the database
          const passwordHash = yield* userService.hashPassword(
            parsedInput.password
          )

          // Create a new user object and save it to the database
          const newUser = User.make({
            id: userId,
            username: parsedInput.username,
            email: parsedInput.email,
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
