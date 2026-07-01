import "dotenv/config"
import { defineConfig } from "drizzle-kit"

const databaseUrl =
  process.env.AUTH_MIGRATION_DATABASE_URL ?? process.env.AUTH_DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    "Set AUTH_MIGRATION_DATABASE_URL (preferred) or AUTH_DATABASE_URL before running auth migrations."
  )
}

export default defineConfig({
  schemaFilter: ["kryno_auth"],
  dialect: "postgresql",
  schema: "./src/schemas/*.schema.ts",
  out: "./migrations",
  migrations: {
    schema: "kryno_auth",
    table: "__drizzle_migrations",
  },
  dbCredentials: {
    url: databaseUrl,
  },
})
