import "dotenv/config"
import { defineConfig } from "drizzle-kit"

const databaseUrl =
  process.env.CLIMBING_MIGRATION_DATABASE_URL ??
  process.env.CLIMBING_DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    "Set CLIMBING_MIGRATION_DATABASE_URL (preferred) or CLIMBING_DATABASE_URL before running climbing migrations."
  )
}

export default defineConfig({
  schemaFilter: ["kryno_climbing"],
  dialect: "postgresql",
  schema: "./src/schemas/*.schema.ts",
  out: "./migrations",
  migrations: {
    schema: "kryno_climbing",
    table: "__drizzle_migrations",
  },
  dbCredentials: {
    url: databaseUrl,
  },
})
