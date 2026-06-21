import { DateTime, Effect } from "effect"
import { SessionService } from "../services/session.service"
import { SessionRepository } from "../repositories/session.repository"
import { UserId } from "../models/user.models"

import {
  ParsedSessionToken,
  Session,
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
  })
})
