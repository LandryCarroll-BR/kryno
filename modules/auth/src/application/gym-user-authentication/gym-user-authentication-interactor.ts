import { Clock, Effect, Layer, Option } from "effect"

import {
  GymUserInvalidCredentials,
  GymUserSessionInvalid,
} from "../../domain/errors.ts"
import { normalizeEmailIdentity } from "../../domain/email-identity.ts"
import {
  CurrentGymUserSessionSuccess,
  GymUserLoginSuccess,
  GymUserSessionId,
  GymUserSessionRecord,
  type CurrentGymUserSessionInput,
  type LoginGymUserInput,
  type LogoutGymUserInput,
} from "../../domain/gym-user.ts"
import { GymRepository } from "../../ports/repositories/gym-repository.ts"
import { GymUserRegistrationRepository } from "../../ports/repositories/gym-user-registration-repository.ts"
import { AuthIdGenerator } from "../../ports/services/auth-id-generator.ts"
import { AuthTokenDigester } from "../../ports/services/auth-token-digester.ts"
import { AuthTokenGenerator } from "../../ports/services/auth-token-generator.ts"
import { PasswordHasher } from "../../ports/services/password-hasher.ts"
import {
  expiresAtMillis,
  gymUserSessionTtlMillis,
} from "../../domain/auth-expiration.ts"
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
    const tokens = yield* AuthTokenGenerator
    const tokenDigester = yield* AuthTokenDigester
    const passwordHasher = yield* PasswordHasher
    const gymRepository = yield* GymRepository
    const repository = yield* GymUserRegistrationRepository

    const login = Effect.fn("GymUserAuthentication.login")(
      (command: LoginGymUserInput) =>
        Effect.gen(function* () {
          const email = normalizeEmailIdentity(command.email)
          const maybeUser = yield* repository.findByEmail(email)
          const maybeCredential = Option.isSome(maybeUser)
            ? yield* repository.findCredentialByUserId(maybeUser.value.id)
            : Option.none()

          const { user, credential } = yield* requireGymUserCredential(
            email,
            maybeUser,
            maybeCredential
          )

          const passwordMatches = yield* passwordHasher.verifyPassword(
            command.password,
            credential.passwordHash
          )

          if (!passwordMatches) {
            return yield* new GymUserInvalidCredentials({
              email,
            })
          }

          yield* requireVerifiedGymUser(user)

          const now = yield* Clock.currentTimeMillis
          const sessionToken = GymUserSessionId.make(
            yield* tokens.nextGymUserSessionToken
          )
          const session = new GymUserSessionRecord({
            id: yield* ids.nextGymUserSessionId,
            userId: user.id,
            tokenDigest: yield* tokenDigester.digestToken(sessionToken),
            expiresAtMillis: expiresAtMillis(now, gymUserSessionTtlMillis),
            active: true,
          })

          yield* repository.saveSession(session)

          return new GymUserLoginSuccess({ user, sessionToken, session })
        })
    )

    const currentSession = Effect.fn("GymUserAuthentication.currentSession")(
      (command: CurrentGymUserSessionInput) =>
        Effect.gen(function* () {
          const tokenDigest = yield* tokenDigester.digestToken(
            command.sessionId
          )
          const session = yield* requireActiveGymUserSession(
            command.sessionId,
            yield* repository.findSessionByTokenDigest(tokenDigest)
          )
          const maybeUser = yield* repository.findById(session.userId)

          if (Option.isNone(maybeUser)) {
            return yield* new GymUserSessionInvalid({
              sessionId: command.sessionId,
            })
          }

          const user = yield* requireVerifiedGymUser(maybeUser.value)
          const activeAffiliationRecords =
            yield* gymRepository.findActiveAffiliationsByUserId(user.id)
          const activeAffiliations = yield* Effect.filter(
            activeAffiliationRecords,
            (affiliation) =>
              Effect.gen(function* () {
                const gym = yield* gymRepository.findGymById(affiliation.gymId)
                return Option.isSome(gym) && gym.value.status === "active"
              })
          )

          return new CurrentGymUserSessionSuccess({
            user,
            session,
            activeAffiliations,
          })
        })
    )

    const logout = Effect.fn("GymUserAuthentication.logout")(
      (command: LogoutGymUserInput) =>
        Effect.gen(function* () {
          const tokenDigest = yield* tokenDigester.digestToken(
            command.sessionId
          )
          const session = yield* requireActiveGymUserSession(
            command.sessionId,
            yield* repository.findSessionByTokenDigest(tokenDigest)
          )

          yield* repository.invalidateSession(session.id)
        })
    )

    return { login, currentSession, logout }
  })
)
