import { Effect, Layer, Option } from "effect"

import {
  SystemAdminInvalidCredentials,
  SystemAdminSessionInvalid,
} from "../../domain/errors.ts"
import { normalizeEmailIdentity } from "../../domain/email-identity.ts"
import {
  CurrentSystemAdminSessionSuccess,
  SystemAdminLoginSuccess,
  SystemAdminSessionId,
  SystemAdminSessionRecord,
  type CurrentSystemAdminSessionInput,
  type LoginSystemAdminInput,
  type LogoutSystemAdminInput,
} from "../../domain/system-admin.ts"
import { SystemAdminBootstrapRepository } from "../../ports/repositories/system-admin-bootstrap-repository.ts"
import { AuthIdGenerator } from "../../ports/services/auth-id-generator.ts"
import { AuthTokenDigester } from "../../ports/services/auth-token-digester.ts"
import { AuthTokenGenerator } from "../../ports/services/auth-token-generator.ts"
import { PasswordHasher } from "../../ports/services/password-hasher.ts"
import { SystemAdminAuthentication } from "./system-admin-authentication-input-boundary.ts"
import {
  requireActiveSystemAdminSession,
  requireSystemAdminCredential,
} from "./system-admin-authentication-policy.ts"

export const SystemAdminAuthenticationInteractor = Layer.effect(
  SystemAdminAuthentication,
  Effect.gen(function* () {
    const ids = yield* AuthIdGenerator
    const tokens = yield* AuthTokenGenerator
    const tokenDigester = yield* AuthTokenDigester
    const passwordHasher = yield* PasswordHasher
    const repository = yield* SystemAdminBootstrapRepository

    const login = Effect.fn("SystemAdminAuthentication.login")(
      (command: LoginSystemAdminInput) =>
        Effect.gen(function* () {
          const email = normalizeEmailIdentity(command.email)
          const maybeAdmin = yield* repository.findAdminByEmail(email)
          const maybeCredential = Option.isSome(maybeAdmin)
            ? yield* repository.findCredentialByAdminId(maybeAdmin.value.id)
            : Option.none()

          const { admin, credential } = yield* requireSystemAdminCredential(
            email,
            maybeAdmin,
            maybeCredential
          )

          const passwordMatches = yield* passwordHasher.verifyPassword(
            command.password,
            credential.passwordHash
          )

          if (!passwordMatches) {
            return yield* new SystemAdminInvalidCredentials({
              email,
            })
          }

          const sessionToken = SystemAdminSessionId.make(
            yield* tokens.nextSystemAdminSessionToken
          )
          const session = new SystemAdminSessionRecord({
            id: yield* ids.nextSystemAdminSessionId,
            adminId: admin.id,
            tokenDigest: yield* tokenDigester.digestToken(sessionToken),
            active: true,
          })

          yield* repository.saveSession(session)

          return new SystemAdminLoginSuccess({ admin, sessionToken, session })
        })
    )

    const currentSession = Effect.fn(
      "SystemAdminAuthentication.currentSession"
    )((command: CurrentSystemAdminSessionInput) =>
      Effect.gen(function* () {
        const tokenDigest = yield* tokenDigester.digestToken(command.sessionId)
        const session = yield* requireActiveSystemAdminSession(
          command.sessionId,
          yield* repository.findSessionByTokenDigest(tokenDigest)
        )
        const admin = yield* repository.findFirstAdmin

        if (Option.isSome(admin) && admin.value.id === session.adminId) {
          return new CurrentSystemAdminSessionSuccess({
            admin: admin.value,
            session,
          })
        }

        return yield* new SystemAdminSessionInvalid({
          sessionId: command.sessionId,
        })
      })
    )

    const logout = Effect.fn("SystemAdminAuthentication.logout")(
      (command: LogoutSystemAdminInput) =>
        Effect.gen(function* () {
          const tokenDigest = yield* tokenDigester.digestToken(
            command.sessionId
          )
          const session = yield* requireActiveSystemAdminSession(
            command.sessionId,
            yield* repository.findSessionByTokenDigest(tokenDigest)
          )

          yield* repository.invalidateSession(session.id)
        })
    )

    return { login, currentSession, logout }
  })
)
