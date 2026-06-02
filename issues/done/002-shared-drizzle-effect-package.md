## Parent PRD

`issues/prd.md`

## What to build

Create the generic `@workspace/drizzle` package that provides Kryno's shared Drizzle + Effect Postgres infrastructure. This package should own database configuration, the shared database service, construction helpers, transaction helpers, Postgres date/time parser setup, and generic persistence error modeling.

## Acceptance criteria

- [ ] `@workspace/drizzle` exists in the packages workspace and is consumable by modules/apps.
- [ ] The package exposes a shared `DrizzleDatabase` service rather than requiring modules to construct clients directly.
- [ ] Live database configuration uses Effect Config and redacted secret handling for `DATABASE_URL`.
- [ ] Optional pool settings, including max connections and connection timeout, are typed and configurable.
- [ ] Drizzle's Effect-native Postgres integration and recommended Postgres date/time parser setup are wired in the shared construction path.
- [ ] A generic typed `PersistenceError` includes operation context for logs/traces.
- [ ] Generic transaction support is exposed for repository adapters and module-specific unit-of-work layers.

## Blocked by

None - can start immediately

## User stories addressed

- User story 4
- User story 5
- User story 9
- User story 10
- User story 17
- User story 18
- User story 19
- User story 48
- User story 50
