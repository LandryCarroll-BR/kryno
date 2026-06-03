import { makePersistenceError, DrizzleDatabase } from "@workspace/drizzle"
import { eq } from "drizzle-orm"
import { Effect, Layer, Option } from "effect"

import { normalizeEmailIdentity } from "../../domain/email-identity.ts"
import {
  SystemAdminCredentialRecord,
  SystemAdminId,
  SystemAdminRecord,
  SystemAdminSessionId,
  SystemAdminSessionRecord,
} from "../../domain/system-admin.ts"
import { SystemAdminBootstrapRepository } from "../../ports/repositories/system-admin-bootstrap-repository.ts"
import {
  systemAdminCredentials,
  systemAdminSessions,
  systemAdmins,
} from "../../schema.ts"

type SystemAdminRow = typeof systemAdmins.$inferSelect
type SystemAdminCredentialRow = typeof systemAdminCredentials.$inferSelect
type SystemAdminSessionRow = typeof systemAdminSessions.$inferSelect

export const SystemAdminBootstrapRepositoryPostgresAdapter = Layer.effect(
  SystemAdminBootstrapRepository,
  Effect.gen(function* () {
    const database = yield* DrizzleDatabase
    const db = database.db

    const run = <A>(operation: string, effect: Effect.Effect<A, unknown>) =>
      effect.pipe(
        Effect.mapError((error) => makePersistenceError(operation, error))
      )

    const findAdmin = (
      operation: string,
      query: Effect.Effect<readonly SystemAdminRow[], unknown>
    ) =>
      run(operation, query).pipe(
        Effect.map((rows) => Option.fromNullishOr(rows[0])),
        Effect.map(Option.map(rowToSystemAdminRecord))
      )

    return {
      findFirstAdmin: findAdmin(
        "auth.systemAdminBootstrap.findFirstAdmin",
        db.select().from(systemAdmins).limit(1)
      ),
      findAdminByEmail: (email) =>
        findAdmin(
          "auth.systemAdminBootstrap.findAdminByEmail",
          db
            .select()
            .from(systemAdmins)
            .where(
              eq(systemAdmins.normalizedEmail, normalizeEmailIdentity(email))
            )
            .limit(1)
        ),
      findCredentialByAdminId: (adminId) =>
        run(
          "auth.systemAdminBootstrap.findCredentialByAdminId",
          db
            .select()
            .from(systemAdminCredentials)
            .where(eq(systemAdminCredentials.adminId, adminId))
            .limit(1)
        ).pipe(
          Effect.map((rows) => Option.fromNullishOr(rows[0])),
          Effect.map(Option.map(rowToSystemAdminCredentialRecord))
        ),
      findSessionByTokenDigest: (tokenDigest) =>
        run(
          "auth.systemAdminBootstrap.findSessionByTokenDigest",
          db
            .select()
            .from(systemAdminSessions)
            .where(eq(systemAdminSessions.tokenDigest, tokenDigest))
            .limit(1)
        ).pipe(
          Effect.map((rows) => Option.fromNullishOr(rows[0])),
          Effect.map(Option.map(rowToSystemAdminSessionRecord))
        ),
      saveFirstAdmin: (admin, credential) =>
        run(
          "auth.systemAdminBootstrap.saveFirstAdmin",
          Effect.all([
            db
              .insert(systemAdmins)
              .values({
                id: admin.id,
                email: normalizeEmailIdentity(admin.email),
                normalizedEmail: normalizeEmailIdentity(admin.email),
                updatedAt: new Date(),
              })
              .onConflictDoUpdate({
                target: systemAdmins.id,
                set: {
                  email: normalizeEmailIdentity(admin.email),
                  normalizedEmail: normalizeEmailIdentity(admin.email),
                  updatedAt: new Date(),
                },
              }),
            db
              .insert(systemAdminCredentials)
              .values({
                adminId: credential.adminId,
                passwordHash: credential.passwordHash,
                updatedAt: new Date(),
              })
              .onConflictDoUpdate({
                target: systemAdminCredentials.adminId,
                set: {
                  passwordHash: credential.passwordHash,
                  updatedAt: new Date(),
                },
              }),
          ]).pipe(Effect.asVoid)
        ),
      saveSession: (session) =>
        run(
          "auth.systemAdminBootstrap.saveSession",
          db
            .insert(systemAdminSessions)
            .values({
              id: session.id,
              adminId: session.adminId,
              tokenDigest: session.tokenDigest,
              active: session.active,
              expiresAt: new Date(session.expiresAtMillis),
            })
            .onConflictDoUpdate({
              target: systemAdminSessions.id,
              set: {
                tokenDigest: session.tokenDigest,
                active: session.active,
                expiresAt: new Date(session.expiresAtMillis),
              },
            })
        ),
      invalidateSession: (sessionId) =>
        run(
          "auth.systemAdminBootstrap.invalidateSession",
          db
            .update(systemAdminSessions)
            .set({ active: false })
            .where(eq(systemAdminSessions.id, sessionId))
        ),
    }
  })
)

const rowToSystemAdminRecord = (row: SystemAdminRow) =>
  new SystemAdminRecord({
    id: SystemAdminId.make(row.id),
    email: row.email,
  })

const rowToSystemAdminCredentialRecord = (row: SystemAdminCredentialRow) =>
  new SystemAdminCredentialRecord({
    adminId: SystemAdminId.make(row.adminId),
    passwordHash: row.passwordHash,
  })

const rowToSystemAdminSessionRecord = (row: SystemAdminSessionRow) =>
  new SystemAdminSessionRecord({
    id: SystemAdminSessionId.make(row.id),
    adminId: SystemAdminId.make(row.adminId),
    tokenDigest: row.tokenDigest,
    expiresAtMillis: dateToMillis(row.expiresAt),
    active: row.active,
  })

const dateToMillis = (value: Date | string) =>
  value instanceof Date ? value.getTime() : new Date(value).getTime()
