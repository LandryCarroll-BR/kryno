## Parent PRD

`issues/prd.md`

## What to build

Switch the API app from test auth wiring to explicit live auth persistence composition by providing the shared database service built from the merged Kryno schema and composing the auth live layer at the app boundary.

## Acceptance criteria

- [ ] The API app provides one shared database client/pool for live auth persistence.
- [ ] The API app composes the auth live layer explicitly rather than relying on test-layer wiring.
- [ ] Production and local environments use the same persistence code path with different database configuration.
- [ ] Persistence failures at the HTTP boundary become generic server errors for API clients.
- [ ] Existing API auth tests are updated or supplemented to protect current behavior without requiring Postgres in the default suite.

## Blocked by

- Blocked by `issues/003-product-database-composition-module.md`
- Blocked by `issues/011-auth-live-layer-composition.md`

## User stories addressed

- User story 4
- User story 10
- User story 11
- User story 24
- User story 49
- User story 60
