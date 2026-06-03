import { describe, expect, it } from "@effect/vitest"
import { DrizzleDatabase, type DrizzleDatabaseShape } from "@workspace/drizzle"
import { Effect, Layer, Option } from "effect"

import { GymUserRegistrationRepositoryPostgresAdapter } from "../src/adapters/repositories/gym-user-registration-repository-postgres.ts"
import {
  GymUserId,
  GymUserRegistrationRecord,
} from "../src/domain/gym-user.ts"
import { GymUserRegistrationRepository } from "../src/ports/repositories/gym-user-registration-repository.ts"

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

  return {
    select: () => ({
      from: (table: { readonly [key: string]: unknown }) => ({
        where: (condition: unknown) => ({
          limit: () =>
            Effect.sync(() => {
              const [column, value] = conditionParts(condition)
              const rows =
                tableKey(table) === "gym_users"
                  ? Array.from(gymUsers.values())
                  : []

              return rows.filter((row) => row[column] === value).slice(0, 1)
            }),
        }),
      }),
    }),
    insert: (table: { readonly [key: string]: unknown }) => ({
      values: (values: Record<string, unknown>) => ({
        onConflictDoUpdate: () =>
          Effect.sync(() => {
            if (tableKey(table) === "gym_users") {
              gymUsers.set(String(values.id), { ...values })
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
