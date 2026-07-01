import "dotenv/config"
import { defineConfig } from "drizzle-kit"

const databaseUrl =
  process.env.GYM_MIGRATION_DATABASE_URL ?? process.env.GYM_DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    "Set GYM_MIGRATION_DATABASE_URL (preferred) or GYM_DATABASE_URL before running gym migrations."
  )
}

export default defineConfig({
  schemaFilter: ["kryno_gym"],
  dialect: "postgresql",
  schema: "./src/schemas/*.schema.ts",
  out: "./migrations",
  migrations: {
    schema: "kryno_gym",
    table: "__drizzle_migrations",
  },
  dbCredentials: {
    url: databaseUrl,
  },
})
