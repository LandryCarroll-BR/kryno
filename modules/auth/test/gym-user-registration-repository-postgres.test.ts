import { describe, expect, it } from "@effect/vitest"
import { DrizzleDatabase, type DrizzleDatabaseShape } from "@workspace/drizzle"
import { Effect, Layer, Option } from "effect"

import { GymUserRegistrationRepositoryPostgresAdapter } from "../src/adapters/repositories/gym-user-registration-repository-postgres.ts"
import { SystemAdminBootstrapRepositoryPostgresAdapter } from "../src/adapters/repositories/system-admin-bootstrap-repository-postgres.ts"
import {
  GymUserId,
  GymUserRegistrationRecord,
} from "../src/domain/gym-user.ts"
import {
  SystemAdminCredentialRecord,
  SystemAdminId,
  SystemAdminRecord,
  SystemAdminSessionId,
  SystemAdminSessionRecord,
} from "../src/domain/system-admin.ts"
import { GymUserRegistrationRepository } from "../src/ports/repositories/gym-user-registration-repository.ts"
import { SystemAdminBootstrapRepository } from "../src/ports/repositories/system-admin-bootstrap-repository.ts"

describe("GymUserRegistrationRepositoryPostgresAdapter", () => {
  it.effect("saves gym users and looks them up by normalized email", () =>
    Effect.gen(function* () {
      const repository = yield* GymUserRegistrationRepository
      const user = new GymUserRegistrationRecord({
        id: GymUserId.make("00000000-0000-0000-0000-000000000001"),
        email: "alex@example.com",
        displayName: "Alex",
        emailVerified: false,
      })

      yield* repository.save(user)

      const found = yield* repository.findByEmail(" ALEX@EXAMPLE.COM ")

      expect(Option.getOrUndefined(found)).toEqual(user)
    }).pipe(Effect.provide(testLayer()))
  )
})

describe("SystemAdminBootstrapRepositoryPostgresAdapter", () => {
  it.effect(
    "saves the first admin and resolves sessions by token digest",
    () =>
      Effect.gen(function* () {
        const repository = yield* SystemAdminBootstrapRepository
        const admin = new SystemAdminRecord({
          id: SystemAdminId.make("10000000-0000-0000-0000-000000000001"),
          email: " Admin@Example.COM ",
        })
        const credential = new SystemAdminCredentialRecord({
          adminId: admin.id,
          passwordHash: "hashed:password",
        })
        const session = new SystemAdminSessionRecord({
          id: SystemAdminSessionId.make(
            "10000000-0000-0000-0000-000000000002"
          ),
          adminId: admin.id,
          tokenDigest: "digest:session-token",
          expiresAtMillis: 1_800_000,
          active: true,
        })

        yield* repository.saveFirstAdmin(admin, credential)
        yield* repository.saveSession(session)

        const first = yield* repository.findFirstAdmin
        const foundByEmail = yield* repository.findAdminByEmail(
          "admin@example.com"
        )
        const foundCredential = yield* repository.findCredentialByAdminId(
          admin.id
        )
        const foundSession = yield* repository.findSessionByTokenDigest(
          "digest:session-token"
        )
        const rawTokenLookup = yield* repository.findSessionByTokenDigest(
          "session-token"
        )

        expect(Option.getOrUndefined(first)).toEqual(
          new SystemAdminRecord({
            id: admin.id,
            email: "admin@example.com",
          })
        )
        expect(Option.getOrUndefined(foundByEmail)).toEqual(
          new SystemAdminRecord({
            id: admin.id,
            email: "admin@example.com",
          })
        )
        expect(Option.getOrUndefined(foundCredential)).toEqual(credential)
        expect(Option.getOrUndefined(foundSession)).toEqual(session)
        expect(Option.isNone(rawTokenLookup)).toBe(true)
      }).pipe(Effect.provide(systemAdminTestLayer()))
  )
})

const testLayer = () =>
  GymUserRegistrationRepositoryPostgresAdapter.pipe(
    Layer.provide(
      Layer.succeed(DrizzleDatabase, ({
        db: makeInMemoryDb(),
        sqlClient: {},
        transaction: <A, E, R>(effect: Effect.Effect<A, E, R>) => effect,
      } as unknown) as DrizzleDatabaseShape)
    )
  )

const makeInMemoryDb = () => {
  const gymUsers = new Map<string, Record<string, unknown>>()
  const systemAdmins = new Map<string, Record<string, unknown>>()
  const systemAdminCredentials = new Map<string, Record<string, unknown>>()
  const systemAdminSessions = new Map<string, Record<string, unknown>>()

  const rowsForTable = (table: { readonly [key: string]: unknown }) => {
    switch (tableKey(table)) {
      case "gym_users":
        return gymUsers
      case "system_admins":
        return systemAdmins
      case "system_admin_credentials":
        return systemAdminCredentials
      case "system_admin_sessions":
        return systemAdminSessions
      default:
        return new Map<string, Record<string, unknown>>()
    }
  }

  const primaryKeyForTable = (
    table: { readonly [key: string]: unknown },
    values: Record<string, unknown>
  ) => {
    switch (tableKey(table)) {
      case "system_admin_credentials":
        return String(values.adminId)
      default:
        return String(values.id)
    }
  }

  return {
    select: () => ({
      from: (table: { readonly [key: string]: unknown }) => ({
        limit: () =>
          Effect.sync(() => Array.from(rowsForTable(table).values()).slice(0, 1)),
        where: (condition: unknown) => ({
          limit: () =>
            Effect.sync(() => {
              const [column, value] = conditionParts(condition)
              const rows = Array.from(rowsForTable(table).values())

              return rows.filter((row) => row[column] === value).slice(0, 1)
            }),
        }),
      }),
    }),
    insert: (table: { readonly [key: string]: unknown }) => ({
      values: (values: Record<string, unknown>) => ({
        onConflictDoUpdate: () =>
          Effect.sync(() => {
            rowsForTable(table).set(primaryKeyForTable(table, values), {
              ...values,
            })
          }),
      }),
    }),
    update: (table: { readonly [key: string]: unknown }) => ({
      set: (values: Record<string, unknown>) => ({
        where: (condition: unknown) =>
          Effect.sync(() => {
            const [column, value] = conditionParts(condition)
            const rows = rowsForTable(table)

            for (const [key, row] of rows) {
              if (row[column] === value) {
                rows.set(key, { ...row, ...values })
              }
            }
          }),
      }),
    }),
  }
}

const tableKey = (table: { readonly [key: string]: unknown }) =>
  String(table[tableNameSymbol(table)])

const tableNameSymbol = (table: object) =>
  Object.getOwnPropertySymbols(table).find(
    (symbol) => symbol.description === "drizzle:Name"
  ) as keyof typeof table

const conditionParts = (condition: unknown): readonly [string, unknown] => {
  const chunks = (condition as { readonly queryChunks: readonly unknown[] })
    .queryChunks
  const column = chunks[1] as { readonly name: string; readonly key?: string }
  const param = chunks[3] as { readonly value: unknown }

  return [column.key ?? snakeToCamel(column.name), param.value]
}

const snakeToCamel = (value: string) =>
  value.replace(/_([a-z])/g, (_, letter: string) => letter.toLocaleUpperCase())

const systemAdminTestLayer = () =>
  SystemAdminBootstrapRepositoryPostgresAdapter.pipe(
    Layer.provide(
      Layer.succeed(DrizzleDatabase, ({
        db: makeInMemoryDb(),
        sqlClient: {},
        transaction: <A, E, R>(effect: Effect.Effect<A, E, R>) => effect,
      } as unknown) as DrizzleDatabaseShape)
    )
  )
