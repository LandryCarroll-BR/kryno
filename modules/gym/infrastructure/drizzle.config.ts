import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schemaFilter: ["gym"],
  dialect: "postgresql",
  schema: "./src/schemas/*.schema.ts",
  out: "./migrations",
  migrations: {
    schema: "gym",
    table: "__drizzle_migrations",
  },
  dbCredentials: {
    url: process.env.GYM_DATABASE_URL!,
  },
})
