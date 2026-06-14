import { SessionRepository } from "@/repositories/session-repository"
import { SessionService } from "@/services/session-service"
import { SessionInputBoundary } from "@/session/session-input-boundary"
import { DateTime, Effect, Layer, Option } from "effect"

import {
  ParsedSessionToken,
  Session,
  SessionWithToken,
} from "@/models/session-entities"

import {
  InvalidSessionSecretHashError,
  InvalidSessionTokenError,
  SessionNotFoundError,
} from "@/errors/session-errors"

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
            lastVerifiedAt: now,
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

          const persistedSessionResult =
            yield* sessionRepository.findById(sessionId)
          if (Option.isNone(persistedSessionResult)) {
            return yield* new SessionNotFoundError({ sessionId })
          }

          const session = persistedSessionResult.value
          const isExpired = yield* session.isExpired()
          if (isExpired) {
            yield* sessionRepository.delete(sessionId)
            return Option.none()
          }

          const tokenSecretHash =
            yield* sessionService.hashSecret(sessionSecret)
          const isValidSessionHash = session.hasSecretHash(tokenSecretHash)
          if (!isValidSessionHash) {
            return yield* new InvalidSessionSecretHashError()
          }

          const isInactive = yield* session.isInactive()
          if (isInactive) {
            const updatedSession = Session.make({
              ...session,
              lastVerifiedAt: yield* DateTime.nowAsDate,
            })
            yield* sessionRepository.update(updatedSession)
          }

          return Option.some(session)
        }
      ),
    }
  })
)
