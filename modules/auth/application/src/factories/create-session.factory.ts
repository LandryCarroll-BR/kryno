import { DateTime, Effect } from "effect"
import { SessionService } from "../services/session.service"
import { SessionRepository } from "../repositories/session.repository"
import { UserId } from "../models/user.models"

import {
  ParsedSessionToken,
  PersistedSession,
  SessionWithToken,
} from "../models/session.models"

export const CreateSessionFactory = Effect.gen(function* () {
  const sessionService = yield* SessionService
  const sessionRepository = yield* SessionRepository

  return Effect.fn("CreateSessionFactory.create")(function* (params: {
    userId: UserId
  }) {
    const now = yield* DateTime.nowAsDate

    const id = yield* sessionService.generateSessionId()
    const userId = UserId.make(params.userId)
    const secret = yield* sessionService.generateSessionSecret()
    const secretHash = yield* sessionService.hashSessionSecret(secret)
    const token = ParsedSessionToken.make({ id, secret }).token

    const session = PersistedSession.make({
      id,
      userId,
      secretHash,
      lastVerifiedAt: now,
      createdAt: now,
    })

    const persistedSession = yield* sessionRepository.create(session)

    const sessionWithToken = SessionWithToken.make({
      id: persistedSession.id,
      userId: persistedSession.userId,
      lastVerifiedAt: persistedSession.lastVerifiedAt,
      createdAt: persistedSession.createdAt,
      token,
    })

    return sessionWithToken
  })
})
