import { Effect, Layer, Option } from "effect"

import {
  SystemAdminInvalidCredentials,
  SystemAdminSessionInvalid,
} from "../../domain/errors.ts"
import { normalizeEmailIdentity } from "../../domain/email-identity.ts"
import {
  CurrentSystemAdminSessionSuccess,
  SystemAdminLoginSuccess,
  SystemAdminSessionRecord,
  type CurrentSystemAdminSessionInput,
  type LoginSystemAdminInput,
  type LogoutSystemAdminInput,
} from "../../domain/system-admin.ts"
import { SystemAdminBootstrapRepository } from "../../ports/repositories/system-admin-bootstrap-repository.ts"
import { AuthIdGenerator } from "../../ports/services/auth-id-generator.ts"
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

          const session = new SystemAdminSessionRecord({
            id: yield* ids.nextSystemAdminSessionId,
            adminId: admin.id,
            active: true,
          })

          yield* repository.saveSession(session)

          return new SystemAdminLoginSuccess({ admin, session })
        })
    )

    const currentSession = Effect.fn(
      "SystemAdminAuthentication.currentSession"
    )((command: CurrentSystemAdminSessionInput) =>
      Effect.gen(function* () {
        const session = yield* requireActiveSystemAdminSession(
          command.sessionId,
          yield* repository.findSessionById(command.sessionId)
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
          yield* requireActiveSystemAdminSession(
            command.sessionId,
            yield* repository.findSessionById(command.sessionId)
          )

          yield* repository.invalidateSession(command.sessionId)
        })
    )

    return { login, currentSession, logout }
  })
)
