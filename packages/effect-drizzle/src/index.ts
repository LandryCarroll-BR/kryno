import { PgClient } from "@effect/sql-pg"
import * as Redacted from "effect/Redacted"
import { Config } from "effect"

const maxConnections = Config.Int("DATABASE_MAX_CONNECTIONS").pipe(
  Config.withDefault(2)
)

export const PgClientFactory = {
  create: (url: Config.Config<Redacted.Redacted<string>>) =>
    PgClient.layerConfig({
      url,
      maxConnections,
    }),
}
