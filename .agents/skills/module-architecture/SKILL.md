---
name: module-architecture
description: Use when creating or refactoring a repo module so it follows Kryno's module structure: a thin module facade, application input boundaries/interactors, ports, adapters, Effect HttpApi contracts, and live/mock/test layers.
---

# Module Architecture

Use this skill when adding a new module under `modules/`, reorganizing a module, adding a new use case, adding ports/adapters, adding Effect HttpApi endpoints/handlers, or changing module exports.

## Canonical Shape

Prefer this structure:

```text
modules/<module>/src/
  index.ts
  <module>.ts

  domain/
    <entity-or-contract>.ts
    errors.ts

  application/
    <use-case>/
      <use-case>-input-boundary.ts
      <use-case>-interactor.ts
      <use-case>-policy.ts        # only when the use case has policy logic

  ports/
    repositories/
      <aggregate-or-use-case>-repository.ts
    services/
      <capability>.ts

  api/
    <module>-api.ts               # convenience re-export for API contracts/handlers
    <module>-group.ts             # HttpApiGroup composition for this module
    <module>-handlers.ts          # HttpApiBuilder handlers for this module's group
    endpoints/
      <use-case>.ts               # HttpApiEndpoint contract for one use case/resource operation

  adapters/
    repositories/
      <repository>-<variant>.ts
    services/
      <service>-<variant>.ts

  layers/
    live-layer.ts
    mock-layer.ts
    test-layer.ts
```

## Rules

- Root `index.ts` should expose the module facade and its layers by default. Do not export ports, adapters, or application internals from root unless there is a deliberate public API reason.
- The module facade lives at `src/<module>.ts` and is named for the module, for example `Auth`. It should be a small Effect service tag used by other modules.
- Facade methods should be business-facing and stable, for example `reserveGymUserEmail` rather than repository-like verbs.
- Use-case input boundaries live under `application/<use-case>/` and expose the lower-level use-case Effect service.
- Interactors implement input boundaries and depend on ports, policies, and domain contracts.
- Ports are Effect service tags for dependencies the application layer needs.
- Group ports by role:
  - `ports/repositories/`: persistence contracts, named for the aggregate/use case, for example `gym-user-registration-repository.ts`.
  - `ports/services/`: external capabilities, named for the capability, for example `password-hasher.ts` or `auth-id-generator.ts`.
- API files define the module's Effect HttpApi transport boundary:
  - `api/endpoints/<use-case>.ts`: one use case or resource operation's endpoint contract. Define the `HttpApiEndpoint`, request payload/query/path/header schemas, success schemas, and endpoint-specific error schemas/status annotations here.
  - `api/<module>-group.ts`: compose the module's endpoints into a single `HttpApiGroup`, usually with the module route prefix, for example `AuthHttpGroup = HttpApiGroup.make("auth").add(...).prefix("/auth")`.
  - `api/<module>-handlers.ts`: define handler builders that map HTTP endpoint payloads to the module facade, not directly to ports or interactors.
  - `api/<module>-api.ts`: optional convenience re-export for the module's API files. It may also export a standalone module API for isolated tests/docs, but the app should own the final product API.
- Keep API contracts separate from handlers. Endpoint files should not call the module facade. Handler files should not redefine request/response schemas.
- Other modules should depend on the module facade, not the module's API handlers or ports. App/server composition code may import module API groups and handler builders.
- Adapters implement ports. Group adapters by role:
  - `adapters/repositories/`: repository implementations, named by repository plus variant, for example `gym-user-registration-repository-memory.ts`.
  - `adapters/services/`: service implementations, named by service plus variant, for example `password-hasher-deterministic.ts`.
- Layers compose services:
  - `live-layer.ts`: facade backed by real application/interactor wiring.
  - `mock-layer.ts`: facade implemented directly for tests or consumers that need a simple stand-in.
  - `test-layer.ts`: application/interactor wiring plus test adapters; expose a convenient test layer.
- Avoid `index.ts` barrels inside subfolders. Prefer explicit file imports and package subpath exports.

## HttpApi Composition

- Each module owns only its `HttpApiGroup`, endpoint contracts, and handler builder for that group.
- The app/server package owns the final product API, global path prefix, docs, server runtime, and complete layer wiring.
- Prefer this cross-module shape:

```ts
// modules/auth/src/api/auth-group.ts
export const AuthHttpGroup = HttpApiGroup.make("auth")
  .add(ReserveGymUserEmailEndpoint)
  .add(BootstrapFirstSystemAdminEndpoint)
  .prefix("/auth")

// modules/auth/src/api/auth-handlers.ts
export const buildAuthHttpHandlers = (
  handlers: HttpApiBuilder.Handlers.FromGroup<typeof AuthHttpGroup>
) =>
  handlers.handle("reserveGymUserEmail", ({ payload }) =>
    Auth.use((auth) => auth.reserveGymUserEmail(payload))
  )

// apps/<app>/src/api.ts
export const KrynoHttpApi = HttpApi.make("KrynoHttpApi")
  .add(AuthHttpGroup)
  .add(OtherModuleHttpGroup)
  .prefix("/api")

export const AuthHttpHandlersLive = HttpApiBuilder.group(
  KrynoHttpApi,
  "auth",
  buildAuthHttpHandlers
)
```

- Avoid exporting a module handler layer that is ambiguously tied to a standalone module API if it will be used in the product API. If a standalone layer is useful, name it clearly, for example `AuthStandaloneHttpHandlersLive`.
- Keep endpoint names stable. Generated clients and handler builders depend on endpoint names.

## Effect Guidance

- Always follow repo `AGENTS.md` Effect instructions before writing Effect code.
- Use the Effect version already used by the module. For Effect v4 modules, prefer `Context.Service` for service tags.
- Prefer `Effect.gen` for interactor implementation.
- Do not use `try/catch` inside `Effect.gen` to catch Effect failures.
- Use `return yield*` for terminating failures in generators.

## Package Exports

`package.json` should make coupling explicit:

- `.` points to `src/index.ts`.
- Expose application interactors only by explicit subpath when composition code needs them.
- Expose ports and adapters only by explicit subpath.
- Expose API contracts and handler builders only by explicit `./api...` subpaths when app/server composition needs them.
- Expose test helpers through `./testing` when useful.

Example:

```json
{
  ".": "./src/index.ts",
  "./application/<use-case>/interactor": "./src/application/<use-case>/<use-case>-interactor.ts",
  "./ports/repositories/<repository>": "./src/ports/repositories/<repository>.ts",
  "./ports/services/<service>": "./src/ports/services/<service>.ts",
  "./api": "./src/api/<module>-api.ts",
  "./api/<module>-group": "./src/api/<module>-group.ts",
  "./api/<module>-handlers": "./src/api/<module>-handlers.ts",
  "./api/endpoints/<use-case>": "./src/api/endpoints/<use-case>.ts",
  "./adapters/repositories/<repository>-<variant>": "./src/adapters/repositories/<repository>-<variant>.ts",
  "./adapters/services/<service>-<variant>": "./src/adapters/services/<service>-<variant>.ts",
  "./testing": "./src/layers/test-layer.ts"
}
```

## Tests

- Other modules should be able to test against the facade with either the live test layer or mock layer.
- Use-case behavior tests should exercise input boundaries/interactors through Effect services, not private helper functions.
- Adapter tests should target adapter behavior only when the adapter has meaningful logic.
- API contract/handler tests should compile or exercise the typed client/server boundary when the handler mapping has meaningful logic. Keep domain behavior assertions in use-case/facade tests.
