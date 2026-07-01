import { PgClient } from "@effect/sql-pg"
import * as Redacted from "effect/Redacted"
import { types } from "pg"
import { Config } from "effect"
import { type CustomTypesConfig } from "pg"

const maxConnections = Config.int("DATABASE_MAX_CONNECTIONS").pipe(
  Config.withDefault(2)
)

const pgTypes: CustomTypesConfig = {
  getTypeParser: (typeId, format) => {
    if (
      [1184, 1114, 1082, 1186, 1231, 1115, 1185, 1187, 1182].includes(typeId)
    ) {
      return (value: string) => value
    }

    return types.getTypeParser(typeId, format)
  },
}

export const PgClientFactory = {
  create: (url: Config.Config<Redacted.Redacted<string>>) =>
    PgClient.layerConfig({
      url,
      maxConnections,
      types: Config.succeed(pgTypes),
    }),
}
