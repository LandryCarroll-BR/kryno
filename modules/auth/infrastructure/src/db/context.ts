import { Config, Context, Effect, Layer } from "effect"
import * as PgDrizzle from "drizzle-orm/effect-postgres"
import { PgClientFactory } from "@packages/effect-drizzle"

import { relations } from "../schemas/relations.schema"

// Create the DB effect with default services
const dbEffect = PgDrizzle.make({ relations }).pipe(
  Effect.provide(PgDrizzle.DefaultServices)
)

// Define a DB service tag for dependency injection
export class AuthDB extends Context.Service<
  AuthDB,
  Effect.Success<typeof dbEffect>
>()("@auth/infrastructure/AuthDB") {}

// Create a layer that provides the DB service
const AuthDBLive = Layer.effect(AuthDB, dbEffect)

const PgClientLive = PgClientFactory.create(
  Config.redacted("AUTH_DATABASE_URL")
)

// Compose all layers together
export const AuthDBContextLive = AuthDBLive.pipe(Layer.provide(PgClientLive))
