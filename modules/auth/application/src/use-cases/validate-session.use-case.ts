import { DateTime, Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"

import {
  InvalidSessionTokenError,
  SessionNotFoundError,
  InvalidSessionSecretHashError,
} from "../errors/session.errors"

import {
  ParsedSessionToken,
  Session,
  SessionToken,
} from "../models/session.models"

import { SessionRepository } from "../repositories/session.repository"
import { SessionService } from "../services/session.service"

export const ValidateSessionInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
}).annotate({ identifier: "ValidateSessionInput" })

export type ValidateSessionInput = typeof ValidateSessionInputSchema.Type

export class ValidateSessionUseCase extends Service<
  ValidateSessionUseCase,
  {
    readonly execute: (
      input: ValidateSessionInput
    ) => Effect.Effect<
      Option.Option<Session>,
      | SessionNotFoundError
      | InvalidSessionTokenError
      | InvalidSessionSecretHashError
    >
  }
>()("@auth/application/ValidateSessionUseCase") {
  static Live = Layer.effect(
    ValidateSessionUseCase,
    Effect.gen(function* () {
      const sessionRepository = yield* SessionRepository
      const sessionService = yield* SessionService

      return {
        execute: Effect.fn("ValidateSessionUseCase.execute")(function* (input) {
          const token = Schema.decodeUnknownEffect(SessionToken)(input.token)
          const { id: sessionId, secret: sessionSecret } =
            yield* ParsedSessionToken.fromString(token.toString()).pipe(
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
        }),
      }
    })
  )
}
