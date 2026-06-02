import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"))
const readText = (path) => readFile(path, "utf8")

describe("local Postgres development loop", () => {
  it("exposes Docker Compose, environment, scripts, and docs for local persistence", async () => {
    const [packageJson, compose, envExample, readme] = await Promise.all([
      readJson("package.json"),
      readText("docker-compose.yml"),
      readText(".env.example"),
      readText("README.md"),
    ])

    assert.match(compose, /postgres:/)
    assert.match(compose, /POSTGRES_DB: kryno/)
    assert.match(compose, /POSTGRES_USER: kryno/)
    assert.match(compose, /5432:5432/)
    assert.match(compose, /pg_isready/)
    assert.match(envExample, /DATABASE_URL=postgres:\/\/kryno:kryno@localhost:5432\/kryno/)
    assert.match(envExample, /DATABASE_POOL_MAX=/)
    assert.match(envExample, /DATABASE_CONNECT_TIMEOUT_MILLIS=/)

    assert.equal(packageJson.scripts["db:up"], "docker compose up -d postgres")
    assert.equal(packageJson.scripts["db:down"], "docker compose down")
    assert.match(packageJson.scripts["db:reset"], /dropdb --if-exists .*kryno/)
    assert.match(packageJson.scripts["db:reset"], /createdb .*kryno/)
    assert.match(packageJson.scripts["db:studio"], /drizzle-kit studio/)

    assert.match(readme, /Local Postgres/i)
    assert.match(readme, /pnpm run db:up/)
    assert.match(readme, /pnpm run db:reset/)
    assert.match(readme, /pnpm run db:studio/)
    assert.match(readme, /Migrations are explicit/i)
    assert.doesNotMatch(readme, /automatically.*startup/i)
  })
})
