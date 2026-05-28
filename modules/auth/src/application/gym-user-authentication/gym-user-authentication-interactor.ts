import { Effect, Layer, Option } from "effect"

import {
  GymUserInvalidCredentials,
  GymUserSessionInvalid,
} from "../../domain/errors.ts"
import {
  CurrentGymUserSessionSuccess,
  GymUserLoginSuccess,
  GymUserSessionRecord,
  type CurrentGymUserSessionInput,
  type LoginGymUserInput,
  type LogoutGymUserInput,
} from "../../domain/gym-user.ts"
import { GymUserRegistrationRepository } from "../../ports/repositories/gym-user-registration-repository.ts"
import { AuthIdGenerator } from "../../ports/services/auth-id-generator.ts"
import { PasswordHasher } from "../../ports/services/password-hasher.ts"
import { GymUserAuthentication } from "./gym-user-authentication-input-boundary.ts"
import {
  requireActiveGymUserSession,
  requireGymUserCredential,
  requireVerifiedGymUser,
} from "./gym-user-authentication-policy.ts"

export const GymUserAuthenticationInteractor = Layer.effect(
  GymUserAuthentication,
  Effect.gen(function* () {
    const ids = yield* AuthIdGenerator
    const passwordHasher = yield* PasswordHasher
    const repository = yield* GymUserRegistrationRepository

    const login = Effect.fn("GymUserAuthentication.login")(
      (command: LoginGymUserInput) =>
        Effect.gen(function* () {
          const maybeUser = yield* repository.findByEmail(command.email)
          const maybeCredential = Option.isSome(maybeUser)
            ? yield* repository.findCredentialByUserId(maybeUser.value.id)
            : Option.none()

          const { user, credential } = yield* requireGymUserCredential(
            command.email,
            maybeUser,
            maybeCredential
          )

          const passwordMatches = yield* passwordHasher.verifyPassword(
            command.password,
            credential.passwordHash
          )

          if (!passwordMatches) {
            return yield* new GymUserInvalidCredentials({
              email: command.email,
            })
          }

          yield* requireVerifiedGymUser(user)

          const session = new GymUserSessionRecord({
            id: yield* ids.nextGymUserSessionId,
            userId: user.id,
            active: true,
          })

          yield* repository.saveSession(session)

          return new GymUserLoginSuccess({ user, session })
        })
    )

    const currentSession = Effect.fn("GymUserAuthentication.currentSession")(
      (command: CurrentGymUserSessionInput) =>
        Effect.gen(function* () {
          const session = yield* requireActiveGymUserSession(
            command.sessionId,
            yield* repository.findSessionById(command.sessionId)
          )
          const maybeUser = yield* repository.findById(session.userId)

          if (Option.isNone(maybeUser)) {
            return yield* new GymUserSessionInvalid({
              sessionId: command.sessionId,
            })
          }

          const user = yield* requireVerifiedGymUser(maybeUser.value)

          return new CurrentGymUserSessionSuccess({
            user,
            session,
          })
        })
    )

    const logout = Effect.fn("GymUserAuthentication.logout")(
      (command: LogoutGymUserInput) =>
        Effect.gen(function* () {
          yield* requireActiveGymUserSession(
            command.sessionId,
            yield* repository.findSessionById(command.sessionId)
          )

          yield* repository.invalidateSession(command.sessionId)
        })
    )

    return { login, currentSession, logout }
  })
)
