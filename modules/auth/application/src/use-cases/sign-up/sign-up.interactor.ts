import { CreateSessionFactory } from "../../factories/create-session.factory"
import { UserAlreadyExistsError } from "../../errors/user.errors"
import { User, UserId } from "../../models/user.models"
import { SignUpInputBoundary } from "./sign-up.input-boundary"
import { Effect, Layer, Option } from "effect"
import { IdentityService } from "../../services/identity.service"
import { UserRepository } from "../../repositories/user.repository"
import { UserService } from "../../services/user.service"
import { SessionService } from "../../services/session.service"

export const SignUpInteractor = Layer.effect(
  SignUpInputBoundary,
  Effect.gen(function* () {
    const identityService = yield* IdentityService
    const userRepository = yield* UserRepository
    const userService = yield* UserService
    const sessionService = yield* SessionService
    const createSession = yield* CreateSessionFactory
    // const signUpOutputBoundary = yield* SignUpOutputBoundary

    return {
      execute: Effect.fn(
        "@workspace/auth/application/use-cases/sign-up-signUpInputBoundary/execute"
      )(function* (input) {
        // Check if the username already exists
        const existingUser = yield* userRepository.findByUsername(
          input.username
        )

        if (Option.some(existingUser)) {
          return yield* new UserAlreadyExistsError({ username: input.username })
        }

        // Generate a secure random string to use as the user ID
        const secureRandomString =
          yield* identityService.generateSecureRandomString()
        const userId = UserId.make(secureRandomString)

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
        const session = yield* createSession({ userId: user.id })
        const cookie = yield* sessionService.createSessionCookie(session)

        return { cookie, session, user }
      }),
    }
  })
)
