import * as PgDrizzle from "drizzle-orm/effect-postgres"
import { Context, Effect, Layer } from "effect"
import { PgClientLive } from "@packages/effect-drizzle"
import { relations } from "@/schemas/relations.schema"

// Create the DB effect with default services
const dbEffect = PgDrizzle.make({ relations }).pipe(
  Effect.provide(PgDrizzle.DefaultServices)
)

// Define a DB service tag for dependency injection
export class DB extends Context.Service<DB, Effect.Success<typeof dbEffect>>()(
  "@auth/infrastructure/db/context/DB"
) {}

// Create a layer that provides the DB service
const DBLive = Layer.effect(DB, dbEffect)

// Compose all layers together
export const DBContextLive = Layer.provideMerge(DBLive, PgClientLive)
