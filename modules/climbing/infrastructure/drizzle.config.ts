import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schemaFilter: ["climbing"],
  dialect: "postgresql",
  schema: "./src/schemas/*.schema.ts",
  out: "./migrations",
  migrations: {
    schema: "climbing",
    table: "__drizzle_migrations",
  },
  dbCredentials: {
    url: process.env.CLIMBING_DATABASE_URL!,
  },
})
