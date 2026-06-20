import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { spawnSync } from "node:child_process"

export const MODULE_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const EFFECT_VERSION = "4.0.0-beta.70"
const EFFECT_VITEST_VERSION = "4.0.0-beta.69"
const NODE_TYPES_VERSION = "^25.1.0"
const TYPESCRIPT_VERSION = "^5.9.3"
const VITEST_VERSION = "^4.0.15"

const SOURCE_DIRECTORIES = {
  application: [
    "src/errors",
    "src/factories",
    "src/models",
    "src/repositories",
    "src/services",
    "src/use-cases",
  ],
  infrastructure: ["src/repositories", "src/services"],
  component: [],
  "adapters/next": ["src/controllers", "src/presenters"],
}

const json = (value) => `${JSON.stringify(value, null, 2)}\n`

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
      dependencies: {
        effect: EFFECT_VERSION,
        [`@${name}/application`]: "workspace:*",
      },
      devDependencies,
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

const tsconfig = (withPaths) =>
  json({
    extends: "@packages/tsconfig/effect.json",
    compilerOptions: {
      baseUrl: ".",
      ...(withPaths
        ? {
            paths: {
              "@/*": ["./src/*"],
            },
          }
        : {}),
      types: ["vitest/globals", "node"],
    },
    include: ["src/**/*.ts", "test/**/*.ts"],
  })

const vitestConfig = `import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    include: ["test/**/*.test.ts"],
  },
})
`

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

  for (const [packagePath, sourceDirectories] of Object.entries(
    SOURCE_DIRECTORIES
  )) {
    const packageRoot = join(moduleRoot, packagePath)
    const packageName =
      packagePath === "adapters/next" ? "adapters-next" : packagePath

    mkdirSync(join(packageRoot, "src"), { recursive: true })
    mkdirSync(join(packageRoot, "test"), { recursive: true })

    for (const directory of sourceDirectories) {
      mkdirSync(join(packageRoot, directory), { recursive: true })
      writeFileSync(join(packageRoot, directory, ".gitkeep"), "")
    }

    writeFileSync(join(packageRoot, "src", "index.ts"), "")
    writeFileSync(join(packageRoot, "test", ".gitkeep"), "")
    writeFileSync(
      join(packageRoot, "package.json"),
      json(packageJson(name, packageName))
    )
    writeFileSync(
      join(packageRoot, "tsconfig.json"),
      tsconfig(packagePath !== "application")
    )
    writeFileSync(join(packageRoot, "vitest.config.ts"), vitestConfig)
  }

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
