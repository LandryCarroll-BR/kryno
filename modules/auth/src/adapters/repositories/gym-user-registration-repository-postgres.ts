import { makePersistenceError, DrizzleDatabase } from "@workspace/drizzle"
import { eq } from "drizzle-orm"
import { Effect, Layer, Option } from "effect"
import { randomUUID } from "node:crypto"

import { normalizeEmailIdentity } from "../../domain/email-identity.ts"
import {
  GymUserCredentialRecord,
  GymUserEmailVerificationTokenRecord,
  GymUserId,
  GymUserPasswordResetTokenRecord,
  GymUserRegistrationRecord,
  GymUserSessionId,
  GymUserSessionRecord,
} from "../../domain/gym-user.ts"
import { GymUserRegistrationRepository } from "../../ports/repositories/gym-user-registration-repository.ts"
import {
  gymUserCredentials,
  gymUserEmailVerificationTokens,
  gymUserPasswordResetTokens,
  gymUserSessions,
  gymUsers,
} from "../../schema.ts"

type GymUserRow = typeof gymUsers.$inferSelect
type GymUserCredentialRow = typeof gymUserCredentials.$inferSelect
type GymUserEmailVerificationTokenRow =
  typeof gymUserEmailVerificationTokens.$inferSelect
type GymUserPasswordResetTokenRow =
  typeof gymUserPasswordResetTokens.$inferSelect
type GymUserSessionRow = typeof gymUserSessions.$inferSelect

export const GymUserRegistrationRepositoryPostgresAdapter = Layer.effect(
  GymUserRegistrationRepository,
  Effect.gen(function* () {
    const database = yield* DrizzleDatabase
    const db = database.db

    const run = <A>(operation: string, effect: Effect.Effect<A, unknown>) =>
      effect.pipe(
        Effect.mapError((error) => makePersistenceError(operation, error))
      )

    const findUser = (
      operation: string,
      query: Effect.Effect<readonly GymUserRow[], unknown>
    ) =>
      run(operation, query).pipe(
        Effect.map((rows) => Option.fromNullishOr(rows[0])),
        Effect.map(Option.map(rowToGymUserRegistrationRecord))
      )

    return {
      findById: (userId) =>
        findUser(
          "auth.gymUserRegistration.findById",
          db.select().from(gymUsers).where(eq(gymUsers.id, userId)).limit(1)
        ),
      findByEmail: (email) =>
        findUser(
          "auth.gymUserRegistration.findByEmail",
          db
            .select()
            .from(gymUsers)
            .where(
              eq(gymUsers.normalizedEmail, normalizeEmailIdentity(email))
            )
            .limit(1)
        ),
      findCredentialByUserId: (userId) =>
        run(
          "auth.gymUserRegistration.findCredentialByUserId",
          db
            .select()
            .from(gymUserCredentials)
            .where(eq(gymUserCredentials.userId, userId))
            .limit(1)
        ).pipe(
          Effect.map((rows) => Option.fromNullishOr(rows[0])),
          Effect.map(Option.map(rowToGymUserCredentialRecord))
        ),
      findSessionByTokenDigest: (tokenDigest) =>
        run(
          "auth.gymUserRegistration.findSessionByTokenDigest",
          db
            .select()
            .from(gymUserSessions)
            .where(eq(gymUserSessions.tokenDigest, tokenDigest))
            .limit(1)
        ).pipe(
          Effect.map((rows) => Option.fromNullishOr(rows[0])),
          Effect.map(Option.map(rowToGymUserSessionRecord))
        ),
      save: (record) =>
        run(
          "auth.gymUserRegistration.save",
          db
            .insert(gymUsers)
            .values({
              id: record.id,
              email: record.email,
              normalizedEmail: normalizeEmailIdentity(record.email),
              displayName: record.displayName,
              emailVerified: record.emailVerified,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: gymUsers.id,
              set: {
                email: record.email,
                normalizedEmail: normalizeEmailIdentity(record.email),
                displayName: record.displayName,
                emailVerified: record.emailVerified,
                updatedAt: new Date(),
              },
            })
        ),
      saveCredential: (credential) =>
        run(
          "auth.gymUserRegistration.saveCredential",
          db
            .insert(gymUserCredentials)
            .values({
              userId: credential.userId,
              passwordHash: credential.passwordHash,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: gymUserCredentials.userId,
              set: {
                passwordHash: credential.passwordHash,
                updatedAt: new Date(),
              },
            })
        ),
      saveEmailVerificationToken: (token) =>
        run(
          "auth.gymUserRegistration.saveEmailVerificationToken",
          db
            .insert(gymUserEmailVerificationTokens)
            .values({
              id: randomUUID(),
              userId: token.userId,
              tokenDigest: token.token,
              expiresAt: new Date(token.expiresAtMillis),
              usedAt:
                token.usedAtMillis === undefined
                  ? null
                  : new Date(token.usedAtMillis),
            })
            .onConflictDoUpdate({
              target: gymUserEmailVerificationTokens.tokenDigest,
              set: {
                expiresAt: new Date(token.expiresAtMillis),
                usedAt:
                  token.usedAtMillis === undefined
                    ? null
                    : new Date(token.usedAtMillis),
              },
            })
        ),
      findEmailVerificationToken: (token) =>
        run(
          "auth.gymUserRegistration.findEmailVerificationToken",
          db
            .select()
            .from(gymUserEmailVerificationTokens)
            .where(eq(gymUserEmailVerificationTokens.tokenDigest, token))
            .limit(1)
        ).pipe(
          Effect.map((rows) => Option.fromNullishOr(rows[0])),
          Effect.map(Option.map(rowToGymUserEmailVerificationTokenRecord))
        ),
      savePasswordResetToken: (token) =>
        run(
          "auth.gymUserRegistration.savePasswordResetToken",
          db
            .insert(gymUserPasswordResetTokens)
            .values({
              id: randomUUID(),
              userId: token.userId,
              tokenDigest: token.token,
              expiresAt: new Date(token.expiresAtMillis),
              usedAt:
                token.usedAtMillis === undefined
                  ? null
                  : new Date(token.usedAtMillis),
            })
            .onConflictDoUpdate({
              target: gymUserPasswordResetTokens.tokenDigest,
              set: {
                expiresAt: new Date(token.expiresAtMillis),
                usedAt:
                  token.usedAtMillis === undefined
                    ? null
                    : new Date(token.usedAtMillis),
              },
            })
        ),
      findPasswordResetToken: (token) =>
        run(
          "auth.gymUserRegistration.findPasswordResetToken",
          db
            .select()
            .from(gymUserPasswordResetTokens)
            .where(eq(gymUserPasswordResetTokens.tokenDigest, token))
            .limit(1)
        ).pipe(
          Effect.map((rows) => Option.fromNullishOr(rows[0])),
          Effect.map(Option.map(rowToGymUserPasswordResetTokenRecord))
        ),
      saveSession: (session) =>
        run(
          "auth.gymUserRegistration.saveSession",
          db
            .insert(gymUserSessions)
            .values({
              id: session.id,
              userId: session.userId,
              tokenDigest: session.tokenDigest,
              active: session.active,
              expiresAt: new Date(session.expiresAtMillis),
              revokedAt:
                session.revokedAtMillis === undefined
                  ? null
                  : new Date(session.revokedAtMillis),
            })
            .onConflictDoUpdate({
              target: gymUserSessions.id,
              set: {
                tokenDigest: session.tokenDigest,
                active: session.active,
                expiresAt: new Date(session.expiresAtMillis),
                revokedAt:
                  session.revokedAtMillis === undefined
                    ? null
                    : new Date(session.revokedAtMillis),
              },
            })
        ),
      invalidateSession: (sessionId, revokedAtMillis) =>
        run(
          "auth.gymUserRegistration.invalidateSession",
          db
            .update(gymUserSessions)
            .set({
              active: false,
              revokedAt: new Date(revokedAtMillis),
            })
            .where(eq(gymUserSessions.id, sessionId))
        ),
    }
  })
)

const rowToGymUserRegistrationRecord = (row: GymUserRow) =>
  new GymUserRegistrationRecord({
    id: GymUserId.make(row.id),
    email: row.email,
    displayName: row.displayName,
    emailVerified: row.emailVerified,
  })

const rowToGymUserCredentialRecord = (row: GymUserCredentialRow) =>
  new GymUserCredentialRecord({
    userId: GymUserId.make(row.userId),
    passwordHash: row.passwordHash,
  })

const rowToGymUserSessionRecord = (row: GymUserSessionRow) =>
  new GymUserSessionRecord({
    id: GymUserSessionId.make(row.id),
    userId: GymUserId.make(row.userId),
    tokenDigest: row.tokenDigest,
    expiresAtMillis: dateToMillis(row.expiresAt),
    active: row.active,
    revokedAtMillis:
      row.revokedAt === null ? undefined : dateToMillis(row.revokedAt),
  })

const rowToGymUserEmailVerificationTokenRecord = (
  row: GymUserEmailVerificationTokenRow
) =>
  new GymUserEmailVerificationTokenRecord({
    token: row.tokenDigest,
    userId: GymUserId.make(row.userId),
    expiresAtMillis: dateToMillis(row.expiresAt),
    used: row.usedAt !== null,
    usedAtMillis: row.usedAt === null ? undefined : dateToMillis(row.usedAt),
  })

const rowToGymUserPasswordResetTokenRecord = (
  row: GymUserPasswordResetTokenRow
) =>
  new GymUserPasswordResetTokenRecord({
    token: row.tokenDigest,
    userId: GymUserId.make(row.userId),
    expiresAtMillis: dateToMillis(row.expiresAt),
    used: row.usedAt !== null,
    usedAtMillis: row.usedAt === null ? undefined : dateToMillis(row.usedAt),
  })

const dateToMillis = (value: Date | string) =>
  value instanceof Date ? value.getTime() : new Date(value).getTime()
