---
name: module-architecture
description: "Use when creating or refactoring Kryno modules organized as application, infrastructure, component, and adapter workspace packages with Effect services, layers, and package exports."
---

# Module Architecture

Use this skill when adding a new module under `modules/`, reorganizing a module package, adding a use case, adding application ports, implementing infrastructure adapters, exposing a component facade, adding a framework adapter, or changing module exports.

Kryno modules are workspace package families. A domain such as `auth` or `climbing` is split into packages by architectural role:

```text
modules/<module>/
  application/
    src/
      index.ts
      errors/
      factories/              # optional application factories
      models/
      repositories/           # application persistence ports
      services/               # application service ports
      use-cases/
    test/
    package.json

  infrastructure/
    src/
      index.ts
      db/
      repositories/           # concrete repository layers
      schemas/                # Drizzle schemas and relations
      services/               # concrete service layers
    test/
      index.ts
      repositories/           # in-memory/test repository layers
      services/               # deterministic/test service layers
    migrations/
    bootstrap.sql
    drizzle.config.ts
    package.json

  component/
    src/
      index.ts                # public module facade and live layer
    test/
      index.ts                # component test layer
    package.json

  adapters/
    next/
      src/
        index.ts              # adapter layers and ManagedRuntime
        controllers/
        factories/            # optional framework-side factories
        models/               # adapter transport models when useful
        presenters/
        utils/                # adapter helpers, including reusable form helpers
        view-models/          # UI-facing view models and form specs
      test/
        index.ts              # adapter test runtime
      package.json
```

Not every module needs every optional folder, but keep the package roles distinct.

## Dependency Direction

- `application` depends only on `effect` and shared, genuinely stable packages. It must not import infrastructure, component, adapters, web frameworks, databases, or another module's component facade.
- `infrastructure` depends on its own `application` package and any required external systems such as Drizzle, database helpers, or another module's public facade when implementing a cross-module port.
- `component` depends on its own `application` and `infrastructure` packages. It exposes the module's public Effect service facade and complete live layer.
- `adapters/<framework>` depends on the module component, any application schemas/models needed for transport parsing, and framework helpers such as `@packages/effect-next`.
- Other modules should depend on a module's component facade, not its infrastructure or framework adapters. They may depend on another module's application package only for shared value schemas or model types that are intentionally public.
- App code should import framework adapters and runtimes; domain/application code should not.

## Application Package

The application package owns business-facing behavior and its ports.

- Put use cases in `src/use-cases/<verb-noun>.use-case.ts`.
- Define each use case as an Effect `Context.Service` class with a `static Live` layer and an `execute` method.
- Co-locate the use case input schema and input type with the use case, for example `SignUpInputSchema` and `SignUpInput`.
- Decode untrusted use case input inside `execute` with `Schema.decodeUnknownEffect(...)(input, { errors: "all" })`.
- Put domain/value schemas in `src/models/*.models.ts`.
- Put typed errors in `src/errors/*.errors.ts`.
- Put persistence ports in `src/repositories/*.repository.ts`.
- Put capability ports in `src/services/*.service.ts`.
- Put application-only helper services/factories in `src/factories/*.factory.ts` when the helper has dependencies or useful test seams.
- Name service tags with package-qualified identifiers, for example `@auth/application/SignUpUseCase`.
- Build `ApplicationLayer` in `src/index.ts` with `Layer.mergeAll(...)` over the live use case layers.
- Export application models, errors, ports, services, factories, and use cases from `src/index.ts` when they are part of the package's public application API.

Use case implementation rules:

- Use `Effect.gen` and `Effect.fn("<Name>.<method>")` for named effects.
- Depend on repository/service/factory ports by yielding their service tags.
- Return typed domain errors through the Effect error channel.
- Use `return yield* new SomeError(...)` for terminating failures in generators.
- Do not catch Effect failures with `try/catch`.
- Keep framework concerns out of use cases: no cookies, redirects, request/response objects, presenters, or database schemas.

## Infrastructure Package

The infrastructure package satisfies application ports with concrete services.

- Implement repository ports under `src/repositories/<name>-db.repository.ts` for database-backed layers.
- Implement external capability ports under `src/services/<name>.service.ts`.
- Keep Drizzle context in `src/db/context.ts`.
- Keep Drizzle table schemas and relations in `src/schemas/*.schema.ts`.
- Compose the production `InfrastructureLayer` in `src/index.ts`.
- If infrastructure layers need a database context, provide it at the infrastructure boundary, for example `Layer.mergeAll(...).pipe(Layer.provide(AuthDBContextLive))`.
- Put test doubles under `test/repositories/` and `test/services/`.
- Export `InfrastructureTestLayer` from `test/index.ts` using in-memory repositories and deterministic/test services.
- Keep migrations and `bootstrap.sql` in the infrastructure package.

Infrastructure may adapt another module's component facade to satisfy an application port. For example, climbing infrastructure can implement `AuthenticatedClimber` by using `@auth/component` and mapping auth failures to climbing application errors. Keep this translation in infrastructure so the application package remains independent.

## Component Package

The component package is the module facade.

- Define a single public service class named for the module, for example `Auth` or `Climbing`, in `src/index.ts`.
- The facade should extend `Service` from `effect/Context`.
- Facade methods should be stable and business-facing. They usually delegate to use case `execute` methods.
- Define `static Live` on the facade as a small adapter from application use case services to facade methods.
- Compose the internal component graph by providing `ApplicationLayer` with `InfrastructureLayer`.
- Export `<Module>Layer` as the complete live facade layer, for example `AuthLayer` or `ClimbingLayer`.
- Do not put web controllers, presenters, database schemas, or framework-specific logic in the component package.
- In `test/index.ts`, compose the application layer with the infrastructure test layer and provide that to the facade `Live` layer. Export `<Module>TestLayer`.

Example shape:

```ts
import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import { InfrastructureLayer } from "@example/infrastructure"
import { ApplicationLayer, DoThingUseCase } from "@example/application"

export class Example extends Service<
  Example,
  {
    readonly doThing: DoThingUseCase["Service"]["execute"]
  }
>()("@example/component/Example") {
  static Live = Layer.effect(
    Example,
    Effect.gen(function* () {
      const doThing = yield* DoThingUseCase
      return { doThing: doThing.execute }
    })
  )
}

const ComponentLayer = Layer.provideMerge(ApplicationLayer, InfrastructureLayer)

export const ExampleLayer = Example.Live.pipe(Layer.provide(ComponentLayer))
```

## Framework Adapters

Framework adapters translate between a delivery mechanism and the component facade. The current adapter package is `adapters/next`.

- Put server/action controllers in `src/controllers/*.controller.ts`.
- Put view-model shaping and user-facing error mapping in `src/presenters/*.presenter.ts`.
- Put UI-facing form/view models in `src/view-models/*.view-model.ts`.
- Put adapter-only transport models in `src/models/*.models.ts` when useful.
- Put adapter-only helpers such as cookie factories in `src/factories/*.factory.ts`.
- Put reusable adapter helpers, such as generic form helpers, in `src/utils/`.
- Controllers may parse form data, read cookies/headers, call the component facade, set cookies, redirect, and catch domain/application errors into presenter or navigation results.
- Controllers should depend on the component facade, not application use cases or infrastructure repositories directly.
- Presenters should be Effect services when they are provided through adapter layers.
- Compose `PresenterLayer`, `AdapterLayer`, and `<Module>AdapterRuntime` in `src/index.ts`.
- The adapter runtime should be a `ManagedRuntime.make(AdapterLayer)` for the live component plus presenter/factory layers.
- In `test/index.ts`, compose the adapter against `<Module>TestLayer` and export `<Module>AdapterTestRuntime`.

### Adapter Form Pattern

When a framework adapter handles server-action forms, prefer a plain view model and small local helpers over a form framework:

- Model each field as a single source of truth: `{ value, label, error }`. Do not keep a separate `fieldErrors` object or a separate valid/invalid status union unless the UI genuinely needs richer per-field state.
- Keep the top-level form state small, usually `{ status, message, fields }`.
- Export option lists from the view model when React selects need them.
- Export one initial view model constant from the view model file.
- In controllers, build submitted fields directly from `FormData` and the previous fields. Keep this code obvious, even if it repeats a few field names.
- Decode use-case input from `submittedFields.<field>.value`.
- In presenters, accept submitted fields, map `SchemaError` issues onto field `error` properties, and return the final view model.
- React views should read `state.fields.<field>.value` and `state.fields.<field>.error` directly.

Keep generic utilities small. A shared `utils/form.ts` should usually only contain generic schema issue formatting helpers such as `formatSchemaIssue` and `fieldErrorFor`. Controllers remain responsible for transport concerns; presenters remain responsible for user-facing state and messages. Only return plain serializable view models to React.

## Package Exports

Each layer is its own workspace package and should expose only the surface needed by neighboring layers and tests.

Application package:

```json
{
  ".": "./src/index.ts",
  "./errors/*": "./src/errors/*",
  "./factories/*": "./src/factories/*",
  "./models/*": "./src/models/*",
  "./repositories/*": "./src/repositories/*",
  "./services/*": "./src/services/*",
  "./use-cases/*": "./src/use-cases/*"
}
```

Infrastructure package:

```json
{
  ".": "./src/index.ts",
  "./test": "./test/index.ts"
}
```

Component package:

```json
{
  ".": "./src/index.ts",
  "./test": "./test/index.ts"
}
```

Framework adapter package:

```json
{
  ".": "./src/index.ts",
  "./test": "./test/index.ts"
}
```

Prefer explicit package exports. Avoid exposing database schemas, infrastructure internals, or individual test-double files unless a real caller needs them.

## Naming Conventions

- Packages use `@<module>/application`, `@<module>/infrastructure`, `@<module>/component`, and `@<module>/adapters-next`.
- Use cases use `<Action><Entity>UseCase`, `static Live`, and `execute`.
- Use case files use kebab case plus `.use-case.ts`.
- Repositories use `<Entity>Repository` for the port and `<Entity>DBRepository` or `<Entity>InMemoryRepository` for layers.
- Services use capability names such as `SessionService`, `UserService`, or `ClimbingSessionIdService`.
- Component facades use the module noun, for example `Auth` or `Climbing`.
- Live layers use `ApplicationLayer`, `InfrastructureLayer`, `<Module>Layer`, `PresenterLayer`, `AdapterLayer`, and `<Module>AdapterRuntime`.
- Test layers use `InfrastructureTestLayer`, `<Module>TestLayer`, `AdapterTestLayer`, and `<Module>AdapterTestRuntime`.

## Tests

- Application tests should exercise use cases through their Effect services and provide test implementations of ports.
- Infrastructure tests should verify repository/service adapters against either in-memory implementations or a controlled database context.
- Component tests should exercise the public facade with `<Module>TestLayer`.
- Adapter tests should use `<Module>AdapterTestRuntime` and assert controller/presenter behavior, including redirects, cookies, and view models.
- Keep domain behavior assertions in application/component tests. Adapter tests should focus on transport and presentation mapping.
- Test support belongs in each package's `test/` folder and is exported through `./test` when other packages need it.

## Effect Guidance

- Always follow repo `AGENTS.md` instructions before writing Effect code:
  - Run `effect-solutions list` to see available guides.
  - Run `effect-solutions show <topic>...` for relevant patterns.
  - Search `~/.local/share/effect-solutions/effect` for real implementations when docs are not enough.
- Always run pnpm scripts with `pnpm run` or `pnpm --filter <package> run <script>`.
- Use the Effect version already used by the module.
- For Effect v4 modules, prefer `Context.Service` service tags via `Service` from `effect/Context`.
- Prefer `Layer.effect` for services that acquire dependencies from other services.
- Prefer `Layer.mergeAll` for composing sibling layers.
- Prefer explicit Layer names over anonymous composition hidden inside app code.

## When Adding A New Use Case

1. Add or update application models/errors as needed.
2. Add any required repository/service/factory ports in the application package.
3. Add `src/use-cases/<use-case>.use-case.ts` with input schema, input type, service class, and `static Live`.
4. Add the use case layer to `ApplicationLayer` and export it from the application package.
5. Implement any new ports in infrastructure and add them to `InfrastructureLayer`.
6. Add test doubles to infrastructure `test/` and include them in `InfrastructureTestLayer`.
7. Expose the use case through the component facade and `<Module>Layer`.
8. Add or update framework controllers/presenters only when the use case is reachable through that adapter.
9. Update package exports if a new public subpath is needed.
10. Run focused typecheck/tests with `pnpm --filter <package> run typecheck` and `pnpm --filter <package> run test`.
