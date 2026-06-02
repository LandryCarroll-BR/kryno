import { describe, expect, it } from "@effect/vitest"
import { ConfigProvider, Effect, Layer, Redacted } from "effect"

import {
  DatabaseConfig,
  drizzlePostgresRawDateTimeTypeIds,
  drizzlePostgresTypeParsers,
  makePersistenceError,
  PersistenceError,
} from "../src/index.ts"

describe("@workspace/drizzle", () => {
  const databaseConfigTestLayer = DatabaseConfig.layer.pipe(
    Layer.provide(
      ConfigProvider.layer(
        ConfigProvider.fromUnknown({
          DATABASE_URL: "postgres://kryno:kryno@localhost:5432/kryno",
          DATABASE_MAX_CONNECTIONS: "12",
          DATABASE_CONNECT_TIMEOUT_MS: "2500",
        })
      )
    )
  )

  it.effect("loads database configuration with a redacted DATABASE_URL", () =>
    Effect.gen(function* () {
      const config = yield* DatabaseConfig

      expect(Redacted.value(config.databaseUrl)).toBe(
        "postgres://kryno:kryno@localhost:5432/kryno"
      )
      expect(String(config.databaseUrl)).not.toContain("kryno@localhost")
      expect(config.maxConnections).toBe(12)
      expect(config.connectTimeoutMs).toBe(2_500)
    }).pipe(Effect.provide(databaseConfigTestLayer))
  )

  it("returns raw strings for Drizzle-managed Postgres date/time types", () => {
    for (const typeId of drizzlePostgresRawDateTimeTypeIds) {
      const parser = drizzlePostgresTypeParsers.getTypeParser(typeId, "text")

      expect(parser("2026-06-01 12:34:56+00")).toBe(
        "2026-06-01 12:34:56+00"
      )
    }
  })

  it("models persistence failures with operation context", () => {
    const cause = new Error("connection refused")
    const error = makePersistenceError("auth.users.insert", cause)

    expect(error).toBeInstanceOf(PersistenceError)
    expect(error.operation).toBe("auth.users.insert")
    expect(error.error).toBe(cause)
  })
})
