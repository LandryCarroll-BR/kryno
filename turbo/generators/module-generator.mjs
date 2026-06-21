import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { spawnSync } from "node:child_process"

export const MODULE_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const EFFECT_VERSION = "4.0.0-beta.70"
const EFFECT_VITEST_VERSION = "4.0.0-beta.70"
const DRIZZLE_VERSION = "1.0.0-rc.4-5d5b77c"
const NODE_TYPES_VERSION = "^25.1.0"
const TYPESCRIPT_VERSION = "^5.9.3"
const VITEST_VERSION = "^4.0.15"

const PLACEHOLDER_DIRECTORIES = {
  application: [
    "src/errors",
    "src/factories",
    "src/models",
    "src/repositories",
    "src/services",
    "src/use-cases",
  ],
  infrastructure: ["src/repositories", "src/services", "test/repositories"],
  component: [],
  "adapters/next": ["src/controllers", "src/presenters"],
}

const json = (value) => `${JSON.stringify(value, null, 2)}\n`

const words = (name) => name.split("-")
const capitalize = (value) => `${value[0].toUpperCase()}${value.slice(1)}`
const pascalCase = (name) => words(name).map(capitalize).join("")
const camelCase = (name) => {
  const [first, ...rest] = words(name)
  return `${first}${rest.map(capitalize).join("")}`
}
const databaseName = (name) => words(name).join("_")
const envPrefix = (name) => databaseName(name).toUpperCase()

const rootDatabaseScripts = (name) => ({
  [`db:${name}:generate`]: `pnpm --filter @${name}/infrastructure run db:generate`,
  [`db:${name}:migrate`]: `pnpm --filter @${name}/infrastructure run db:migrate`,
  [`db:${name}:studio`]: `pnpm --filter @${name}/infrastructure run db:studio`,
})

export function updateRootPackageJson(name, root = process.cwd()) {
  const packageJsonPath = join(root, "package.json")
  const rootPackageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
  const scripts = Object.entries(rootPackageJson.scripts ?? {})
  const moduleScripts = rootDatabaseScripts(name)
  const moduleScriptNames = new Set(Object.keys(moduleScripts))
  const existingScripts = scripts.filter(
    ([script]) => !moduleScriptNames.has(script)
  )
  const lastDatabaseScriptIndex = existingScripts.findLastIndex(([script]) =>
    script.startsWith("db:")
  )

  existingScripts.splice(
    lastDatabaseScriptIndex + 1,
    0,
    ...Object.entries(moduleScripts)
  )

  rootPackageJson.scripts = Object.fromEntries(existingScripts)
  writeFileSync(packageJsonPath, json(rootPackageJson))
}

export function updateDockerCompose(name, root = process.cwd()) {
  const composePath = join(root, "docker-compose.yml")
  const compose = readFileSync(composePath, "utf8")
  const moduleBootstrapPath = `./modules/${name}/infrastructure/bootstrap.sql`

  if (compose.includes(moduleBootstrapPath)) {
    return
  }

  const lines = compose.split("\n")
  const postgresIndex = lines.findIndex((line) => line === "  postgres:")
  const volumesIndex = lines.findIndex(
    (line, index) => index > postgresIndex && line === "    volumes:"
  )

  if (postgresIndex === -1 || volumesIndex === -1) {
    throw new Error("Could not find the postgres volumes in docker-compose.yml")
  }

  let volumesEndIndex = volumesIndex + 1
  while (
    volumesEndIndex < lines.length &&
    (lines[volumesEndIndex].startsWith("      - ") ||
      lines[volumesEndIndex].trim() === "")
  ) {
    volumesEndIndex += 1
  }

  const initScriptNumbers = lines
    .slice(volumesIndex + 1, volumesEndIndex)
    .map((line) => line.match(/\/docker-entrypoint-initdb\.d\/(\d+)-/)?.[1])
    .filter(Boolean)
    .map(Number)
  const nextInitScriptNumber =
    (initScriptNumbers.length === 0 ? 0 : Math.max(...initScriptNumbers)) + 10
  const initScriptPrefix = String(nextInitScriptNumber).padStart(3, "0")
  const bootstrapMount =
    `      - ${moduleBootstrapPath}` +
    `:/docker-entrypoint-initdb.d/${initScriptPrefix}-create-${name}-role.sql:ro`

  lines.splice(volumesEndIndex, 0, bootstrapMount)
  writeFileSync(composePath, lines.join("\n"))
}

const packageJson = (name, packageName) => {
  const common = {
    name: `@${name}/${packageName}`,
    version: "0.0.0",
    type: "module",
    private: true,
    scripts: {
      test: "vitest run --passWithNoTests",
      typecheck: "tsc --noEmit",
    },
    exports: {
      ".": "./src/index.ts",
    },
  }

  if (packageName === "application") {
    common.exports = {
      ...common.exports,
      "./errors/*": "./src/errors/*",
      "./factories/*": "./src/factories/*",
      "./models/*": "./src/models/*",
      "./repositories/*": "./src/repositories/*",
      "./services/*": "./src/services/*",
      "./use-cases/*": "./src/use-cases/*",
    }
  } else {
    common.exports = {
      ...common.exports,
      "./test": "./test/index.ts",
    }
  }

  const devDependencies = {
    "@effect/vitest": EFFECT_VITEST_VERSION,
    "@packages/tsconfig": "workspace:*",
    "@types/node": NODE_TYPES_VERSION,
    typescript: TYPESCRIPT_VERSION,
    vitest: VITEST_VERSION,
  }

  if (packageName === "application") {
    return {
      ...common,
      dependencies: {
        effect: EFFECT_VERSION,
      },
      devDependencies,
    }
  }

  if (packageName === "infrastructure") {
    return {
      ...common,
      scripts: {
        ...common.scripts,
        "db:generate": "drizzle-kit generate --config drizzle.config.ts",
        "db:migrate": "drizzle-kit migrate --config drizzle.config.ts",
        "db:studio": "drizzle-kit studio --config drizzle.config.ts",
      },
      dependencies: {
        effect: EFFECT_VERSION,
        "drizzle-orm": DRIZZLE_VERSION,
        [`@${name}/application`]: "workspace:*",
        "@packages/effect-drizzle": "workspace:*",
      },
      devDependencies: {
        ...devDependencies,
        "drizzle-kit": DRIZZLE_VERSION,
      },
    }
  }

  if (packageName === "component") {
    return {
      ...common,
      dependencies: {
        effect: EFFECT_VERSION,
        [`@${name}/application`]: "workspace:*",
        [`@${name}/infrastructure`]: "workspace:*",
      },
      devDependencies,
    }
  }

  return {
    ...common,
    name: `@${name}/adapters-next`,
    dependencies: {
      effect: EFFECT_VERSION,
      [`@${name}/application`]: "workspace:*",
      [`@${name}/component`]: "workspace:*",
      [`@${name}/infrastructure`]: "workspace:*",
      "@packages/effect-next": "workspace:*",
    },
    devDependencies,
  }
}

const tsconfig = (packagePath) =>
  json({
    extends: "@packages/tsconfig/effect.json",
    compilerOptions: {
      baseUrl: ".",
      ...(packagePath === "component" || packagePath === "adapters/next"
        ? {
            paths: {
              "@/*": ["./src/*"],
            },
          }
        : {}),
      types: ["vitest/globals", "node"],
    },
    include: [
      "src/**/*.ts",
      "test/**/*.ts",
      ...(packagePath === "infrastructure" ? ["drizzle.config.ts"] : []),
    ],
  })

const vitestConfig = `import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    include: ["test/**/*.test.ts"],
  },
})
`

const drizzleConfig = (name) => {
  const schema = databaseName(name)
  const environment = envPrefix(name)

  return `import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schemaFilter: ["${schema}"],
  dialect: "postgresql",
  schema: "./src/schemas/*.schema.ts",
  out: "./migrations",
  migrations: {
    schema: "${schema}",
    table: "__drizzle_migrations",
  },
  dbCredentials: {
    url: process.env.${environment}_DATABASE_URL!,
  },
})
`
}

const bootstrapSql = (name) => {
  const database = databaseName(name)

  return `CREATE ROLE ${database}_role LOGIN PASSWORD '${database}_local';

GRANT CONNECT, CREATE ON DATABASE kryno TO ${database}_role;
`
}

const schema = (name) => {
  const database = databaseName(name)
  const variable = camelCase(name)

  return `import { snakeCase } from "drizzle-orm/pg-core"

export const ${variable}Schema = snakeCase.schema("${database}").existing()
`
}

const relations = `import { defineRelations } from "drizzle-orm"

export const relations = defineRelations({})
`

const databaseContext = (name) => {
  const service = `${pascalCase(name)}DB`
  const environment = envPrefix(name)

  return `import { Config, Context, Effect, Layer } from "effect"
import * as PgDrizzle from "drizzle-orm/effect-postgres"
import { PgClientFactory } from "@packages/effect-drizzle"

import { relations } from "../schemas/relations.schema"

const dbEffect = PgDrizzle.make({ relations }).pipe(
  Effect.provide(PgDrizzle.DefaultServices)
)

export class ${service} extends Context.Service<
  ${service},
  Effect.Success<typeof dbEffect>
>()("@${name}/infrastructure/${service}") {}

const ${service}Live = Layer.effect(${service}, dbEffect)

const PgClientLive = PgClientFactory.create(
  Config.redacted("${environment}_DATABASE_URL")
)

export const ${service}ContextLive = ${service}Live.pipe(
  Layer.provide(PgClientLive)
)
`
}

const infrastructureIndex = (name) => {
  const service = `${pascalCase(name)}DB`
  return `export { ${service}, ${service}ContextLive } from "./db/context"\n`
}

export function validateModuleName(name, root = process.cwd()) {
  if (typeof name !== "string" || !MODULE_NAME_PATTERN.test(name)) {
    return "Module name must be kebab-case using lowercase letters and numbers"
  }

  if (existsSync(join(root, "modules", name))) {
    return `Module "${name}" already exists`
  }

  return true
}

export function runPnpmInstall(root = process.cwd()) {
  const result = spawnSync("pnpm", ["install"], {
    cwd: root,
    stdio: "inherit",
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error(`pnpm install failed with exit code ${result.status}`)
  }
}

export function scaffoldModule({
  name,
  root = process.cwd(),
  install = runPnpmInstall,
}) {
  const validation = validateModuleName(name, root)
  if (validation !== true) {
    throw new Error(validation)
  }

  const moduleRoot = join(root, "modules", name)

  for (const [packagePath, placeholderDirectories] of Object.entries(
    PLACEHOLDER_DIRECTORIES
  )) {
    const packageRoot = join(moduleRoot, packagePath)
    const packageName =
      packagePath === "adapters/next" ? "adapters-next" : packagePath

    mkdirSync(join(packageRoot, "src"), { recursive: true })
    mkdirSync(join(packageRoot, "test"), { recursive: true })

    for (const directory of placeholderDirectories) {
      mkdirSync(join(packageRoot, directory), { recursive: true })
      writeFileSync(join(packageRoot, directory, ".gitkeep"), "")
    }

    const hasTestEntrypoint = packagePath !== "application"

    writeFileSync(
      join(packageRoot, "src", "index.ts"),
      packagePath === "infrastructure" ? infrastructureIndex(name) : ""
    )
    writeFileSync(
      join(packageRoot, "test", hasTestEntrypoint ? "index.ts" : ".gitkeep"),
      hasTestEntrypoint ? "export {}\n" : ""
    )
    writeFileSync(
      join(packageRoot, "package.json"),
      json(packageJson(name, packageName))
    )
    writeFileSync(join(packageRoot, "tsconfig.json"), tsconfig(packagePath))
    writeFileSync(join(packageRoot, "vitest.config.ts"), vitestConfig)

    if (packagePath === "infrastructure") {
      mkdirSync(join(packageRoot, "src", "db"), { recursive: true })
      mkdirSync(join(packageRoot, "src", "schemas"), { recursive: true })
      writeFileSync(join(packageRoot, "bootstrap.sql"), bootstrapSql(name))
      writeFileSync(join(packageRoot, "drizzle.config.ts"), drizzleConfig(name))
      writeFileSync(
        join(packageRoot, ".env"),
        `${envPrefix(name)}_DATABASE_URL=postgres://${databaseName(name)}_role:${databaseName(name)}_local@localhost:5432/kryno\n`
      )
      writeFileSync(
        join(packageRoot, "src", "db", "context.ts"),
        databaseContext(name)
      )
      writeFileSync(
        join(packageRoot, "src", "schemas", `${name}.schema.ts`),
        schema(name)
      )
      writeFileSync(
        join(packageRoot, "src", "schemas", "relations.schema.ts"),
        relations
      )
    }
  }

  updateRootPackageJson(name, root)
  updateDockerCompose(name, root)
  install(root)

  return moduleRoot
}

export function registerModuleGenerator(plop, root = process.cwd()) {
  plop.setGenerator("module", {
    description: "Scaffold a blank auth-shaped module",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the module name?",
        validate: (name) => validateModuleName(name, root),
      },
    ],
    actions: [
      (answers) => {
        const moduleRoot = scaffoldModule({
          name: answers.name,
          root,
        })

        return `Created module at ${moduleRoot} and installed dependencies`
      },
    ],
  })
}
