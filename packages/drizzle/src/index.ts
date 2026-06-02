import { PgClient } from "@effect/sql-pg"
import type { PgClient as PgClientService } from "@effect/sql-pg/PgClient"
import * as PgDrizzle from "drizzle-orm/effect-postgres"
import type {
  EffectDrizzlePgConfig,
  EffectPgDatabase,
  EffectPgQueryResultHKT,
  EffectPgTransaction,
} from "drizzle-orm/effect-postgres"
import type { AnyRelations, EmptyRelations } from "drizzle-orm/relations"
import { Config, Effect, Layer, Option, Redacted, Schema } from "effect"
import * as Context from "effect/Context"
import type { Scope } from "effect/Scope"
import type { SqlError } from "effect/unstable/sql/SqlError"
import type { CustomTypesConfig } from "pg"
import { types } from "pg"

export interface DatabaseConfigShape {
  readonly databaseUrl: Redacted.Redacted
  readonly maxConnections?: number | undefined
  readonly connectTimeoutMs?: number | undefined
}

export class DatabaseConfig extends Context.Service<
  DatabaseConfig,
  DatabaseConfigShape
>()("@kryno/drizzle/DatabaseConfig") {
  static readonly layer = Layer.effect(
    DatabaseConfig,
    Effect.gen(function* () {
      const databaseUrl = yield* Config.redacted("DATABASE_URL")
      const maxConnections = yield* optionalInt("DATABASE_MAX_CONNECTIONS")
      const connectTimeoutMs = yield* optionalInt("DATABASE_CONNECT_TIMEOUT_MS")

      return {
        databaseUrl,
        maxConnections,
        connectTimeoutMs,
      }
    })
  )
}

export class PersistenceError extends Schema.TaggedErrorClass<PersistenceError>()(
  "PersistenceError",
  {
    operation: Schema.String,
    error: Schema.Defect,
  }
) {}

export const makePersistenceError = (
  operation: string,
  error: unknown
): PersistenceError => new PersistenceError({ operation, error })

export const drizzlePostgresRawDateTimeTypeIds = [
  1184, 1114, 1082, 1186, 1231, 1115, 1185, 1187, 1182,
] as const

const drizzlePostgresRawDateTimeTypeIdSet = new Set<number>(
  drizzlePostgresRawDateTimeTypeIds
)

export const drizzlePostgresTypeParsers = {
  getTypeParser: (typeId: number, format?: "text" | "binary") => {
    if (drizzlePostgresRawDateTimeTypeIdSet.has(typeId)) {
      return (value: string) => value
    }

    return types.getTypeParser(typeId, format)
  },
} satisfies CustomTypesConfig

export type DrizzlePgDatabase<
  TRelations extends AnyRelations = EmptyRelations,
> = EffectPgDatabase<TRelations>

export type DrizzlePgTransaction<
  TRelations extends AnyRelations = EmptyRelations,
> = EffectPgTransaction<EffectPgQueryResultHKT, TRelations>

export interface DrizzleDatabaseShape<
  TRelations extends AnyRelations = EmptyRelations,
> {
  readonly db: DrizzlePgDatabase<TRelations>
  readonly sqlClient: PgClientService
  readonly transaction: <A, E, R>(
    effect: Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E | SqlError, R>
}

export class DrizzleDatabase extends Context.Service<
  DrizzleDatabase,
  DrizzleDatabaseShape
>()("@kryno/drizzle/DrizzleDatabase") {}

export const makePgClientLayer = (
  config: DatabaseConfigShape
): Layer.Layer<PgClient.PgClient, SqlError> =>
  PgClient.layer({
    url: config.databaseUrl,
    maxConnections: config.maxConnections,
    connectTimeout:
      config.connectTimeoutMs === undefined
        ? undefined
        : `${config.connectTimeoutMs} millis`,
    types: drizzlePostgresTypeParsers,
  })

export const makeDrizzleDatabaseLayer = <
  TRelations extends AnyRelations = EmptyRelations,
>(
  options: EffectDrizzlePgConfig<TRelations> = {}
): Layer.Layer<DrizzleDatabase, never, PgClient.PgClient | Scope> =>
  Layer.effect(
    DrizzleDatabase,
    Effect.gen(function* () {
      const sqlClient = yield* PgClient.PgClient
      const db = yield* PgDrizzle.make(options).pipe(
        Effect.provide(PgDrizzle.DefaultServices)
      )

      return {
        db: db as DrizzlePgDatabase,
        sqlClient,
        transaction: (effect) => sqlClient.withTransaction(effect),
      }
    })
  )

export const DrizzleDatabaseLive = <
  TRelations extends AnyRelations = EmptyRelations,
>(
  options: EffectDrizzlePgConfig<TRelations> = {}
) =>
  makeDrizzleDatabaseLayer(options).pipe(
    Layer.provideMerge(
      Layer.effect(
        PgClient.PgClient,
        Effect.gen(function* () {
          const config = yield* DatabaseConfig
          return yield* PgClient.make({
            url: config.databaseUrl,
            maxConnections: config.maxConnections,
            connectTimeout:
              config.connectTimeoutMs === undefined
                ? undefined
                : `${config.connectTimeoutMs} millis`,
            types: drizzlePostgresTypeParsers,
          })
        })
      )
    ),
    Layer.provide(DatabaseConfig.layer)
  )

const optionalInt = (
  name: string
): Effect.Effect<number | undefined, Config.ConfigError> =>
  Config.option(Config.int(name)).pipe(
    Effect.map((value) => Option.getOrUndefined(value))
  )
