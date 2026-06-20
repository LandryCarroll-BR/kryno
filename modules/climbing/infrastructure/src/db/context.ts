import { Config, Context, Effect, Layer } from "effect"
import * as PgDrizzle from "drizzle-orm/effect-postgres"
import { PgClientFactory } from "@packages/effect-drizzle"

import { relations } from "../schemas/relations.schema"

const dbEffect = PgDrizzle.make({ relations }).pipe(
  Effect.provide(PgDrizzle.DefaultServices)
)

export class ClimbingDB extends Context.Service<
  ClimbingDB,
  Effect.Success<typeof dbEffect>
>()("@climbing/infrastructure/ClimbingDB") {}

const ClimbingDBLive = Layer.effect(ClimbingDB, dbEffect)

const PgClientLive = PgClientFactory.create(
  Config.redacted("CLIMBING_DATABASE_URL")
)

export const ClimbingDBContextLive = ClimbingDBLive.pipe(
  Layer.provide(PgClientLive)
)
