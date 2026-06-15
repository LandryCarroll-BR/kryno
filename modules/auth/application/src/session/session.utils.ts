import {
  InvalidSessionSecretHashError,
  InvalidSessionTokenError,
  SessionNotFoundError,
} from "@/session/session.errors"
import { UserId } from "@/user/user.models"

import {
  ParsedSessionToken,
  Session,
  SessionToken,
  SessionWithToken,
} from "@/session/session.models"
import { SessionRepository } from "@/session/session.repositories"
import { SessionService } from "@/session/session.services"
import { DateTime, Effect, Option } from "effect"

export const createSession = Effect.fn("session/create-session")(
  function* (params: { userId: UserId }) {
    const sessionService = yield* SessionService
    const sessionRepository = yield* SessionRepository

    const now = yield* DateTime.nowAsDate

    const id = yield* sessionService.generateId()
    const userId = UserId.make(params.userId)
    const secret = yield* sessionService.generateSecret()
    const secretHash = yield* sessionService.hashSecret(secret)
    const token = ParsedSessionToken.make({ id, secret }).token

    const session = Session.make({
      id,
      userId,
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
)

export const validateSession = Effect.fn("session-interactor/validate-session")(
  function* (params: { token: SessionToken }) {
    const sessionRepository = yield* SessionRepository
    const sessionService = yield* SessionService

    const { id: sessionId, secret: sessionSecret } =
      yield* ParsedSessionToken.fromString(params.token).pipe(
        Effect.mapError(() => new InvalidSessionTokenError())
      )

    const persistedSessionResult = yield* sessionRepository.findById(sessionId)
    if (Option.isNone(persistedSessionResult)) {
      return yield* new SessionNotFoundError({ sessionId })
    }

    const session = persistedSessionResult.value
    const isExpired = yield* session.isExpired()
    if (isExpired) {
      yield* sessionRepository.delete(sessionId)
      return Option.none()
    }

    const tokenSecretHash = yield* sessionService.hashSecret(sessionSecret)
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
)
