import { DateTime, Effect, Option } from "effect"
import { SessionService } from "../services/session.service"
import { SessionRepository } from "../repositories/session.repository"
import {
  ParsedSessionToken,
  PersistedSession,
  Session,
} from "../models/session.models"

import {
  InvalidSessionSecretHashError,
  InvalidSessionTokenError,
  SessionNotFoundError,
} from "../errors/session.errors"

export const ValidateSessionFactory = Effect.gen(function* () {
  const sessionService = yield* SessionService
  const sessionRepository = yield* SessionRepository

  return Effect.fn("ValidateSessionUseCase.execute")(function* (params: {
    token: string
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

    const isValidSessionHash = yield* sessionService.verifySessionSecret({
      secret: sessionSecret,
      secretHash: session.secretHash,
    })

    if (!isValidSessionHash) {
      return yield* new InvalidSessionSecretHashError()
    }

    const isInactive = yield* session.isInactive()
    if (isInactive) {
      const updatedSession = PersistedSession.make({
        ...session,
        lastVerifiedAt: yield* DateTime.nowAsDate,
      })
      yield* sessionRepository.update(updatedSession)
    }

    return Option.some(
      Session.make({
        id: session.id,
        userId: session.userId,
        lastVerifiedAt: session.lastVerifiedAt,
        createdAt: session.createdAt,
      })
    )
  })
})
