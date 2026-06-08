import { SessionRepository } from "@/repositories/session-repository"
import { SessionService } from "@/services/session-service"
import { SessionInputBoundary } from "@/session/session-input-boundary"
import { DateTime, Effect, Layer, Option } from "effect"

import {
  Session,
  sessionIsExpired,
  sessionSecretHashIsEqual,
  sessionStructFromToken,
  SessionToken,
  SessionWithToken,
} from "@/entites/session-entities"

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
          const token = SessionToken.make(`${id}.${secret}`)

          const session = Session.make({
            id,
            secretHash,
            createdAt: now,
          })

          const persistedSession = yield* sessionRepository.create(session)

          const sessionWithToken = SessionWithToken.make({
            ...persistedSession,
            token: token,
          })

          return sessionWithToken
        }
      ),

      validateSession: Effect.fn("session-interactor/validate-session")(
        function* (token) {
          const session = yield* sessionStructFromToken(token).pipe(
            Effect.mapError(() => new InvalidSessionTokenError())
          )

          const persistedSession = yield* sessionRepository.findById(session.id)
          if (Option.isNone(persistedSession)) {
            return yield* new SessionNotFoundError({ sessionId: session.id })
          }

          const sessionValue = persistedSession.value

          const isExpired = yield* sessionIsExpired(sessionValue)

          if (isExpired) {
            yield* sessionRepository.deleteSession(session.id)
            return Option.none()
          }

          const tokenSecretHash = yield* sessionService.hashSecret(
            session.secret
          )

          const isValidSessionHash = sessionSecretHashIsEqual(
            tokenSecretHash,
            sessionValue.secretHash
          )

          if (!isValidSessionHash) {
            return yield* new InvalidSessionSecretHashError()
          }

          return Option.some(sessionValue)
        }
      ),
    }
  })
)
