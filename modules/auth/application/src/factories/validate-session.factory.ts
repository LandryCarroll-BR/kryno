import { DateTime, Effect, Option } from "effect"

import {
  InvalidSessionSecretHashError,
  InvalidSessionTokenError,
  SessionNotFoundError,
} from "../errors/session.errors"

import {
  ParsedSessionToken,
  Session,
  SessionToken,
} from "../models/session.models"

import { SessionRepository } from "../repositories/session.repository"
import { SessionService } from "../services/session.service"

export const ValidateSessionFactory = Effect.gen(function* () {
  const sessionRepository = yield* SessionRepository
  const sessionService = yield* SessionService

  return Effect.fn("ValidateSession.execute")(function* (params: {
    token: SessionToken
  }) {
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

    const tokenSecretHash =
      yield* sessionService.hashSessionSecret(sessionSecret)
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
  })
})
