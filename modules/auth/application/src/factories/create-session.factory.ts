import { DateTime, Effect } from "effect"
import { SessionService } from "../services/session.service"
import { SessionRepository } from "../repositories/session.repository"
import { IdentityService } from "../services/identity.service"
import { UserId } from "../models/user.models"

import {
  ParsedSessionToken,
  Session,
  SessionId,
  SessionSecret,
  SessionWithToken,
} from "../models/session.models"

export const CreateSessionFactory = Effect.gen(function* () {
  const sessionService = yield* SessionService
  const sessionRepository = yield* SessionRepository
  const identityService = yield* IdentityService

  return Effect.fn("CreateSession.execute")(function* (params: {
    userId: UserId
  }) {
    const now = yield* DateTime.nowAsDate

    const id = yield* identityService
      .generateSecureRandomString()
      .pipe(Effect.map(SessionId.make))
    const userId = UserId.make(params.userId)
    const secret = yield* identityService
      .generateSecureRandomString()
      .pipe(Effect.map(SessionSecret.make))
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
