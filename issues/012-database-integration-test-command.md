## Parent PRD

`issues/prd.md`

## What to build

Add a separate database integration test command and fixture path so database-backed auth repository tests can run against isolated Postgres without slowing the default fast test suite.

## Acceptance criteria

- [ ] Default `pnpm run test` remains fast and does not require Postgres.
- [ ] A separate integration test command runs database-backed tests.
- [ ] The integration setup uses Testcontainers or an equivalent isolated Postgres fixture if acceptable for the repo runtime.
- [ ] Database integration tests cover repository contract behavior, transactions, normalized email lookup, constraints, and token/session hash lookup.
- [ ] Local reset/migration tooling works with the integration workflow where relevant.

## Blocked by

- Blocked by `issues/001-local-postgres-dev-loop.md`
- Blocked by `issues/003-product-database-composition-module.md`
- Blocked by `issues/009-database-backed-auth-repositories.md`

## User stories addressed

- User story 12
- User story 13
- User story 15
- User story 56
- User story 58
