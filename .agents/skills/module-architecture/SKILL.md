---
name: module-architecture
description: Use when creating or refactoring a repo module so it follows Kryno's module structure: a thin module facade, application input boundaries/interactors, ports, adapters, domain contracts, and live/mock/test layers.
---

# Module Architecture

Use this skill when adding a new module under `modules/`, reorganizing a module, adding a new use case, adding ports/adapters, or changing module exports.

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
    <dependency>.ts

  adapters/
    <dependency>-<variant>.ts
    http-<use-case>.ts            # only for REST/API transport schemas or handlers

  layers/
    live-layer.ts
    mock-layer.ts
    test-layer.ts
```

## Rules

- Root `index.ts` should expose the module facade and its layers by default. Do not export ports, adapters, or application internals from root unless there is a deliberate public API reason.
- The module facade lives at `src/<module>.ts` and is named for the module, for example `Auth`. It should be a small Effect `Context.Tag` interface used by other modules.
- Facade methods should be business-facing and stable, for example `reserveGymUserEmail` rather than repository-like verbs.
- Use-case input boundaries live under `application/<use-case>/` and expose the lower-level use-case Effect service.
- Interactors implement input boundaries and depend on ports, policies, and domain contracts.
- Ports are Effect service tags for dependencies the application layer needs.
- Adapters implement ports. Name adapters by port plus variant, for example `password-hasher-deterministic.ts` or `gym-user-registration-repository-memory.ts`.
- HTTP adapters are for REST/API transport only. Other modules should depend on the module facade, not HTTP adapters.
- Layers compose services:
  - `live-layer.ts`: facade backed by real application/interactor wiring.
  - `mock-layer.ts`: facade implemented directly for tests or consumers that need a simple stand-in.
  - `test-layer.ts`: application/interactor wiring plus test adapters; expose a convenient test layer.
- Avoid `index.ts` barrels inside subfolders. Prefer explicit file imports and package subpath exports.

## Effect Guidance

- Always follow repo `AGENTS.md` Effect instructions before writing Effect code.
- Keep Effect v3-style `Context.Tag` unless the module is explicitly upgraded.
- Prefer `Effect.gen` for interactor implementation.
- Do not use `try/catch` inside `Effect.gen` to catch Effect failures.
- Use `return yield*` for terminating failures in generators.

## Package Exports

`package.json` should make coupling explicit:

- `.` points to `src/index.ts`.
- Expose application interactors only by explicit subpath when composition code needs them.
- Expose ports and adapters only by explicit subpath.
- Expose test helpers through `./testing` when useful.

Example:

```json
{
  ".": "./src/index.ts",
  "./application/<use-case>/interactor": "./src/application/<use-case>/<use-case>-interactor.ts",
  "./ports/<dependency>": "./src/ports/<dependency>.ts",
  "./adapters/<dependency>-<variant>": "./src/adapters/<dependency>-<variant>.ts",
  "./testing": "./src/layers/test-layer.ts"
}
```

## Tests

- Other modules should be able to test against the facade with either the live test layer or mock layer.
- Use-case behavior tests should exercise input boundaries/interactors through Effect services, not private helper functions.
- Adapter tests should target adapter behavior only when the adapter has meaningful logic.
