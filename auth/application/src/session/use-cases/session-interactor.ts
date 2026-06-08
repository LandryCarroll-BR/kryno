import { SessionRepository } from "@/session/ports/session-repository"
import { SessionService } from "@/session/ports/session-service"
import { SessionInputBoundary } from "@/session/use-cases/session-input-boundary"
import { DateTime, Effect, Layer, Option } from "effect"

import { Session, SessionWithToken } from "@/session/domain/session-entities"
import { ParsedSessionToken } from "@/session/domain/session-value-objects"

import {
  InvalidSessionSecretHashError,
  InvalidSessionTokenError,
  SessionNotFoundError,
} from "@/session/domain/session-errors"

export const SessionInteractor = Layer.effect(
  SessionInputBoundary,
  Effect.gen(function* () {
    const sessionService = yield* SessionService
    const sessionRepository = yield* SessionRepository

    return {
      createSession: Effect.fn("session-interactor/create-session")(
        function* () {
          const now = yield* DateTime.nowAsDate

          const id = yield* sessionService.generateId()
          const secret = yield* sessionService.generateSecret()
          const secretHash = yield* sessionService.hashSecret(secret)
          const token = ParsedSessionToken.make({ id, secret }).token

          const session = Session.make({
            id,
            secretHash,
            createdAt: now,
          })

          const persistedSession = yield* sessionRepository.create(session)

          const sessionWithToken = SessionWithToken.make({
            ...persistedSession,
            token,
          })

          return sessionWithToken
        }
      ),

      validateSession: Effect.fn("session-interactor/validate-session")(
        function* (token) {
          const { id: sessionId, secret: sessionSecret } =
            yield* ParsedSessionToken.fromString(token).pipe(
              Effect.mapError(() => new InvalidSessionTokenError())
            )

          const persistedSession = yield* sessionRepository.findById(sessionId)
          if (Option.isNone(persistedSession)) {
            return yield* new SessionNotFoundError({ sessionId })
          }

          const sessionValue = persistedSession.value

          const isExpired = yield* sessionValue.isExpired()

          if (isExpired) {
            yield* sessionRepository.deleteSession(sessionId)
            return Option.none()
          }

          const tokenSecretHash =
            yield* sessionService.hashSecret(sessionSecret)

          const isValidSessionHash = sessionValue.hasSecretHash(tokenSecretHash)

          if (!isValidSessionHash) {
            return yield* new InvalidSessionSecretHashError()
          }

          return Option.some(sessionValue)
        }
      ),
    }
  })
)
