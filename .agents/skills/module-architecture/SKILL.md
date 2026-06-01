---
name: module-architecture
description: "Use when creating or refactoring a repo module so it follows Kryno's module structure: a thin module facade with its facade layer, application input boundaries/interactors, ports, adapters, Effect HttpApi contracts, and clearly separated production/test/mock layers."
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
    <module>-group.ts             # HttpApiGroup composition for this module
    <module>-handlers.ts          # HttpApiBuilder handlers for this module's group
    <module>-authorization.ts      # optional HttpApiMiddleware/session authorization for protected endpoints
    endpoints/
      <feature-area>.ts           # HttpApiEndpoint contracts for one cohesive feature area

  adapters/
    repositories/
      <repository>-<variant>.ts
    services/
      <service>-<variant>.ts

  layers/
    live-layer.ts              # only when real production adapters exist
    mock-layer.ts
    test-layer.ts
```

## Rules

- Root `index.ts` should expose the module facade and its layers by default. Do not export ports, adapters, or application internals from root unless there is a deliberate public API reason.
- The module facade lives at `src/<module>.ts` and is named for the module, for example `Auth`. It should be a small Effect service tag used by other modules.
- Facade methods should be business-facing and stable, for example `reserveGymUserEmail` rather than repository-like verbs.
- The facade service should own its facade adapter layer, for example `Auth.layer`, when the implementation only maps facade methods to application input boundaries. Do not call this `AuthLive`; it is not a complete production layer until all production adapters are provided.
- Use-case input boundaries live under `application/<use-case>/` and expose the lower-level use-case Effect service.
- Interactors implement input boundaries and depend on ports, policies, and domain contracts.
- Ports are Effect service tags for dependencies the application layer needs.
- Group ports by role:
  - `ports/repositories/`: persistence contracts, named for the aggregate/use case, for example `gym-user-registration-repository.ts`.
  - `ports/services/`: external capabilities, named for the capability, for example `password-hasher.ts` or `auth-id-generator.ts`.
- API files define the module's Effect HttpApi transport boundary:
  - `api/endpoints/<feature-area>.ts`: endpoint contracts for one cohesive feature area, for example `gym-user-authentication.ts`, `gym-request.ts`, or `system-admin-bootstrap.ts`. A file may contain multiple closely related endpoints when they share request/response vocabulary. Define the `HttpApiEndpoint`, request payload/query/path/header schemas, success schemas, and endpoint-specific error schemas/status annotations here.
  - `api/<module>-group.ts`: compose the module's endpoints into a single `HttpApiGroup`, usually with the module route prefix, for example `AuthHttpGroup = HttpApiGroup.make("auth").add(...).prefix("/auth")`.
  - `api/<module>-handlers.ts`: define handler builders that map HTTP endpoint payloads to the module facade, not directly to ports or interactors. Handlers may read values provided by HTTP middleware, such as current session ids, and add them to facade inputs.
  - `api/<module>-authorization.ts`: when the module owns transport authorization, define `HttpApiMiddleware.Service` classes, provided request context tags, and live middleware layers here. The middleware should validate credentials through the module facade and provide typed values, such as `CurrentGymUserSessionId`, to downstream handlers.
  - A standalone `HttpApi` for isolated module tests/docs may live beside the group when useful, for example `AuthHttpApi = HttpApi.make("AuthApi").add(AuthHttpGroup)`. Do not add a separate `<module>-api.ts` file unless it is actually used as a public convenience entrypoint.
- Keep API contracts separate from handlers and authorization. Endpoint files should not call the module facade. Handler files should not redefine request/response schemas. Authorization files should not define business use cases; they adapt HTTP credentials into typed request context.
- Other modules should depend on the module facade, not the module's API handlers or ports. App/server composition code may import module API groups and handler builders.
- Adapters implement ports. Group adapters by role:
  - `adapters/repositories/`: repository implementations, named by repository plus variant, for example `gym-user-registration-repository-memory.ts`.
  - `adapters/services/`: service implementations, named by service plus variant, for example `password-hasher-deterministic.ts`.
- Layers compose services:
  - `src/<module>.ts`: define the module facade tag and its facade adapter layer, for example `Auth.layer`, when the layer still requires application input boundaries.
  - `live-layer.ts`: complete production composition only. It should provide the facade, interactors, and real adapters such as database repositories, real email delivery, token generation, config, and other production services. Omit this file until that production composition exists.
  - `test-layer.ts`: real application/interactor wiring plus test adapters. Expose `<Module>ApplicationTestLayer` for tests that exercise input boundaries directly, and `<Module>TestLayer` for tests that exercise the public module facade.
  - `mock-layer.ts`: facade implemented directly with canned or configurable responses for other modules that need a stand-in. It should not exercise module business logic.
- Avoid `index.ts` barrels inside subfolders. Prefer explicit file imports and package subpath exports.

## HttpApi Composition

- Each module owns only its `HttpApiGroup`, endpoint contracts, and handler builder for that group.
- The app/server or dedicated API package owns the final product API, global path prefix, docs, server runtime, and complete layer wiring.
- If the app applies a global prefix such as `/api`, the module handler builder may type its `handlers` argument against the prefixed group with `HttpApiGroup.AddPrefix<typeof AuthHttpGroup, "/api">`, while the module group itself still only declares its module prefix such as `/auth`.
- Protected endpoints should attach module-owned middleware in the group, for example `CurrentGymUserSessionEndpoint.middleware(AuthHttpAuthorization.gymUser)`. The app handler layer should provide the module's authorization layer when building the product handlers.
- Prefer this cross-module shape:

```ts
// modules/auth/src/api/auth-group.ts
const { gymUser, systemAdmin } = AuthHttpAuthorization

export const AuthHttpGroup = HttpApiGroup.make("auth")
  .add(ReserveGymUserEmailEndpoint)
  .add(CurrentGymUserSessionEndpoint.middleware(gymUser))
  .add(ApproveGymCreationRequestEndpoint.middleware(systemAdmin))
  .prefix("/auth")

export const AuthHttpApi = HttpApi.make("AuthApi").add(AuthHttpGroup)

// modules/auth/src/api/auth-handlers.ts
export type ApiPrefixedAuthHttpGroup = HttpApiGroup.AddPrefix<
  typeof AuthHttpGroup,
  "/api"
>

export const buildAuthHttpHandlers = (
  handlers: HttpApiBuilder.Handlers.FromGroup<ApiPrefixedAuthHttpGroup>
) =>
  handlers
    .handle("reserveGymUserEmail", ({ payload }) =>
      Auth.use((auth) => auth.reserveGymUserEmail(payload))
    )
    .handle("currentGymUserSession", () =>
      CurrentGymUserSessionId.pipe(
        Effect.flatMap((sessionId) =>
          Auth.use((auth) => auth.currentGymUserSession({ sessionId }))
        )
      )
    )

// modules/api/src/kryno-http-api.ts
export const KrynoHttpApi = HttpApi.make("KrynoHttpApi")
  .add(AuthHttpGroup)
  .add(OtherModuleHttpGroup)
  .prefix("/api")

// modules/api/src/kryno-http-handlers.ts
export const KrynoAuthHttpHandlersLive = HttpApiBuilder.group(
  KrynoHttpApi,
  "auth",
  buildAuthHttpHandlers
)

export const KrynoHttpHandlersLive = KrynoAuthHttpHandlersLive.pipe(
  Layer.provide(AuthHttpAuthorization.layer)
)
```

- Avoid exporting a module handler layer that is ambiguously tied to a standalone module API if it will be used in the product API. If a standalone layer is useful, name it clearly, for example `AuthStandaloneHttpHandlersLive`.
- Keep endpoint names stable. Generated clients, OpenAPI, and handler builders depend on endpoint names.
- Prefer session identifiers from bearer authorization middleware for current-session and logout endpoints instead of putting session ids in route paths.

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
- Expose authorization middleware through an explicit API subpath when product handler composition needs it, for example `./api/auth-authorization`.
- Expose test helpers through `./testing` when useful.
- Do not export `live-layer.ts` or a `<Module>Live` symbol until it is backed by production adapters. A facade adapter layer belongs on the facade service itself, for example `Auth.layer`.

Example:

```json
{
  ".": "./src/index.ts",
  "./application/<use-case>/interactor": "./src/application/<use-case>/<use-case>-interactor.ts",
  "./ports/repositories/<repository>": "./src/ports/repositories/<repository>.ts",
  "./ports/services/<service>": "./src/ports/services/<service>.ts",
  "./api/<module>-group": "./src/api/<module>-group.ts",
  "./api/<module>-handlers": "./src/api/<module>-handlers.ts",
  "./api/<module>-authorization": "./src/api/<module>-authorization.ts",
  "./api/endpoints/<feature-area>": "./src/api/endpoints/<feature-area>.ts",
  "./adapters/repositories/<repository>-<variant>": "./src/adapters/repositories/<repository>-<variant>.ts",
  "./adapters/services/<service>-<variant>": "./src/adapters/services/<service>-<variant>.ts",
  "./testing": "./src/layers/test-layer.ts"
}
```

## Tests

- Other modules should test against the facade with either `<Module>TestLayer` when they need real module behavior with test infrastructure, or `<Module>Mock` when they only need a stand-in.
- Use `<Module>ApplicationTestLayer` for tests that exercise application input boundaries/interactors directly.
- Use-case behavior tests should exercise input boundaries/interactors through Effect services, not private helper functions.
- Adapter tests should target adapter behavior only when the adapter has meaningful logic.
- API contract/handler tests should compile or exercise the typed client/server boundary when the handler mapping has meaningful logic. Keep domain behavior assertions in use-case/facade tests.
