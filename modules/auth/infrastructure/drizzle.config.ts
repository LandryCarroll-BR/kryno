import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schemaFilter: ["auth"],
  dialect: "postgresql",
  schema: "./src/schemas/*.schema.ts",
  out: "./migrations",
  migrations: {
    schema: "auth",
    table: "__drizzle_migrations",
  },
  dbCredentials: {
    url: process.env.AUTH_DATABASE_URL!,
  },
})
