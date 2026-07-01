import { Config, Context, Effect, Layer } from "effect"
import * as PgDrizzle from "drizzle-orm/effect-postgres"
import { PgClientFactory } from "@packages/effect-drizzle"

import { relations } from "../schemas/relations.schema"

const dbEffect = PgDrizzle.make({ relations }).pipe(
  Effect.provide(PgDrizzle.DefaultServices)
)

export class GymDB extends Context.Service<
  GymDB,
  Effect.Success<typeof dbEffect>
>()("@gym/infrastructure/GymDB") {}

const GymDBLive = Layer.effect(GymDB, dbEffect)

const PgClientLive = PgClientFactory.create(
  Config.redacted("GYM_DATABASE_URL")
)

export const GymDBContextLive = GymDBLive.pipe(
  Layer.provide(PgClientLive)
)
