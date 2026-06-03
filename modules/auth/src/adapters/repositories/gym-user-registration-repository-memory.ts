import { Effect, Layer, Option } from "effect"

import { normalizeEmailIdentity } from "../../domain/email-identity.ts"
import { GymUserSessionRecord } from "../../domain/gym-user.ts"
import type {
  GymUserCredentialRecord,
  GymUserEmailVerificationTokenRecord,
  GymUserPasswordResetTokenRecord,
  GymUserRegistrationRecord,
} from "../../domain/gym-user.ts"
import { GymUserRegistrationRepository } from "../../ports/repositories/gym-user-registration-repository.ts"

export const GymUserRegistrationRepositoryMemoryAdapter = Layer.sync(
  GymUserRegistrationRepository,
  () => {
    const recordsById = new Map<string, GymUserRegistrationRecord>()
    const recordsByEmail = new Map<string, GymUserRegistrationRecord>()
    const credentialsByUserId = new Map<string, GymUserCredentialRecord>()
    const sessionsById = new Map<string, GymUserSessionRecord>()
    const sessionIdsByTokenDigest = new Map<string, string>()
    const emailVerificationTokensByToken = new Map<
      string,
      GymUserEmailVerificationTokenRecord
    >()
    const passwordResetTokensByToken = new Map<
      string,
      GymUserPasswordResetTokenRecord
    >()

    return {
      findById: (userId: GymUserRegistrationRecord["id"]) =>
        Effect.sync(() => Option.fromNullishOr(recordsById.get(userId))),
      findByEmail: (email: string) =>
        Effect.sync(() =>
          Option.fromNullishOr(recordsByEmail.get(normalizeEmailIdentity(email)))
        ),
      findCredentialByUserId: (userId: GymUserRegistrationRecord["id"]) =>
        Effect.sync(() =>
          Option.fromNullishOr(credentialsByUserId.get(userId))
        ),
      findSessionByTokenDigest: (tokenDigest: string) =>
        Effect.sync(() => {
          const sessionId = sessionIdsByTokenDigest.get(tokenDigest)
          return Option.fromNullishOr(
            sessionId === undefined ? undefined : sessionsById.get(sessionId)
          )
        }),
      save: (record: GymUserRegistrationRecord) =>
        Effect.sync(() => {
          recordsById.set(record.id, record)
          recordsByEmail.set(normalizeEmailIdentity(record.email), record)
        }),
      saveCredential: (credential: GymUserCredentialRecord) =>
        Effect.sync(() => {
          credentialsByUserId.set(credential.userId, credential)
        }),
      saveEmailVerificationToken: (
        token: GymUserEmailVerificationTokenRecord
      ) =>
        Effect.sync(() => {
          emailVerificationTokensByToken.set(token.token, token)
        }),
      findEmailVerificationToken: (token: string) =>
        Effect.sync(() =>
          Option.fromNullishOr(emailVerificationTokensByToken.get(token))
        ),
      savePasswordResetToken: (token: GymUserPasswordResetTokenRecord) =>
        Effect.sync(() => {
          passwordResetTokensByToken.set(token.token, token)
        }),
      findPasswordResetToken: (token: string) =>
        Effect.sync(() =>
          Option.fromNullishOr(passwordResetTokensByToken.get(token))
        ),
      saveSession: (session: GymUserSessionRecord) =>
        Effect.sync(() => {
          sessionsById.set(session.id, session)
          sessionIdsByTokenDigest.set(session.tokenDigest, session.id)
        }),
      invalidateSession: (
        sessionId: GymUserSessionRecord["id"],
        revokedAtMillis: number
      ) =>
        Effect.sync(() => {
          const session = sessionsById.get(sessionId)
          if (session !== undefined) {
            sessionsById.set(
              sessionId,
              new GymUserSessionRecord({
                id: session.id,
                userId: session.userId,
                tokenDigest: session.tokenDigest,
                expiresAtMillis: session.expiresAtMillis,
                active: false,
                revokedAtMillis,
              })
            )
          }
        }),
    }
  }
)
