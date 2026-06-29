---
name: module-architecture
description: "Create or refactor Kryno modules organized as application, infrastructure, component, and framework-adapter workspace packages. Use for module boundaries, Effect services and layers, use-case contracts, controllers, presenters, view models, server actions, app views, tests, and package exports."
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
        utils/                # optional helpers shared by multiple adapter features
        view-models/          # client-safe UI-facing view models and options
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
- Server-side app code should import framework controllers and runtimes. Client views should import only the adapter's client-safe view-model subpath. Domain/application code should not import either.

## Application Package

The application package owns business-facing behavior and its ports.

- Put use cases in `src/use-cases/<verb-noun>.use-case.ts`.
- Define each use case as an Effect `Context.Service` class with a `static Live` layer and an `execute` method.
- Co-locate the use case input schema and input type with the use case, for example `SignUpInputSchema` and `SignUpInput`.
- Co-locate an explicit output type with the use case, for example `CreateBoulderOutput`, even when it currently aliases a domain model. Use that contract at controller and presenter boundaries.
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
- Put client-safe UI-facing state, field metadata, and option lists in `src/view-models/*.view-model.ts`.
- Put adapter-only transport models in `src/models/*.models.ts` when useful.
- Put adapter-only helpers such as cookie factories in `src/factories/*.factory.ts`.
- Put a helper in `src/utils/` only after multiple adapter features share it. Keep feature-specific schema formatting and field-error mapping with the presenter that owns them.
- Controllers may decode form data, read cookies/headers, call the component facade, set cookies, redirect, and route failures to presenters or navigation results.
- Controllers should depend on the component facade, not application use cases or infrastructure repositories directly.
- Presenters should be Effect services when they are provided through adapter layers.
- Compose `PresenterLayer`, `AdapterLayer`, and `<Module>AdapterRuntime` in `src/index.ts`.
- The adapter runtime should be a `ManagedRuntime.make(AdapterLayer)` for the live component plus presenter/factory layers.
- In `test/index.ts`, compose the adapter against `<Module>TestLayer` and export `<Module>AdapterTestRuntime`.

### Server-Action Delivery Flow

Keep each delivery layer narrow:

- The server action is the framework entry point. Give it the `useActionState` shape `(previousState, formData) => Promise<ViewModel>`.
- In the action, run the controller with `<Module>AdapterRuntime`, perform app-only success effects such as `revalidatePath`, and return the controller's view model. Do not parse input, call the component facade, or construct presentation state there.
- Build the controller as an `Effect.fn("<Controller>.make")` factory that acquires adapter and component services once and returns a named `handle` effect.
- In `handle`, resolve transport context first, decode the raw payload with the application input schema, invoke the component facade, and pass the output contract to the presenter.
- For simple forms, decode `{ token, ...Object.fromEntries(formData) }` directly rather than maintaining field-by-field extraction, option validation, or submitted-state helpers in the controller. Let the schema validate unknown values.
- Recover typed failures at the controller boundary with `Effect.catchTags`: send validation failures to the presenter and navigation failures such as unauthenticated access to redirects.
- Recover defects only at this outer delivery boundary, mapping them to the presenter's unexpected-error state. Keep defects out of the typed application error model.
- The React view owns rendering only. Inject the action, initialize `useActionState` with the exported initial view model, render exported option lists, and read all labels, values, messages, and errors from adapter view data.

### View Models and Presenters

Use a plain, readonly, serializable view model:

- Keep one top-level object with an explicit status union such as `"idle" | "success" | "invalid" | "error"`, a message, fields, and field errors. Avoid separate top-level state variants when the view always needs the same shape.
- Model field display data as `{ label, value }`. Keep validation messages in a separate `errors` record keyed by `keyof ViewModel["fields"]`; do not add valid/invalid unions or duplicate errors to every field.
- Represent every select option consistently as `{ label, value }`, including options whose display label equals their submitted value.
- Export option lists and one initial view model constant from the view-model file. Use `readonly`, `as const`, and `satisfies` to preserve literal values while checking the public shape.
- Keep the view-model barrel client-safe: export only types and serializable values, never runtimes, controllers, Effect services, or server-only modules.

Make the presenter the sole owner of presentation policy:

- Accept application output contracts for success and the previous view model plus a typed error for failures.
- On success, derive the result from the initial view model when the form should reset, then set the success status and message.
- On schema failure, preserve the previous view model and replace the status, message, and complete field-error record.
- Convert `SchemaError` issues to field messages inside the presenter. Keep a formatter or field lookup as a presenter-local static helper until another presenter genuinely reuses it.
- On an unexpected defect, preserve the previous state and return a generic user-facing error; never expose defect details.
- Do not add a presenter method merely to return the initial constant. Do not let controllers or React views invent statuses, messages, or error mappings.

Only return plain serializable view models to React. Treat the create-boulder files under `modules/climbing/adapters/next/` and `apps/web/features/climbing/components/create-boulder/` as the reference implementation for this flow.

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
  "./view-models": "./src/view-models/index.ts",
  "./test": "./test/index.ts"
}
```

Use `./view-models` as a client-safe app import boundary. Prefer explicit package exports. Avoid exposing database schemas, infrastructure internals, individual test-double files, or server runtime code through client-facing subpaths.

## Naming Conventions

- Packages use `@<module>/application`, `@<module>/infrastructure`, `@<module>/component`, and `@<module>/adapters-next`.
- Use cases use `<Action><Entity>UseCase`, `static Live`, and `execute`.
- Use-case contracts use `<Action><Entity>InputSchema`, `<Action><Entity>Input`, and `<Action><Entity>Output`.
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
- Import the production view model and initial state in adapter/view tests. Do not duplicate production view-model types in test-only files.
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
3. Add `src/use-cases/<use-case>.use-case.ts` with input schema, input/output types, service class, and `static Live`.
4. Add the use case layer to `ApplicationLayer` and export it from the application package.
5. Implement any new ports in infrastructure and add them to `InfrastructureLayer`.
6. Add test doubles to infrastructure `test/` and include them in `InfrastructureTestLayer`.
7. Expose the use case through the component facade and `<Module>Layer`.
8. Add or update the adapter view model, presenter, and controller when the use case is reachable through that adapter.
9. Add the thin server action and rendering-only app view when exposing a server-action form.
10. Update package exports, including the client-safe `./view-models` subpath when needed.
11. Run focused typecheck/tests with `pnpm --filter <package> run typecheck` and `pnpm --filter <package> run test`.
