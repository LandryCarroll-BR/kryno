## Parent PRD

`issues/prd.md`

## What to build

Implement database-backed auth repository adapters that depend on the shared `DrizzleDatabase` service and map Drizzle rows into domain records explicitly. This slice should make durable signup/auth-related records possible without leaking database row shapes into interactors or module facades.

## Acceptance criteria

- [ ] Auth repository adapters live inside the auth module and depend on `DrizzleDatabase`.
- [ ] Adapters do not construct their own database clients or pools.
- [ ] Repository methods map Drizzle rows into existing domain/application records through explicit construction.
- [ ] Signup-related records persist durably across server restarts.
- [ ] Lookup paths use normalized email values where required.
- [ ] Token/session lookup paths use stored digests rather than raw bearer tokens.
- [ ] Database-backed repository tests cover contract behavior, constraints, normalized lookup, and token/session digest lookup.

## Blocked by

- Blocked by `issues/004-auth-postgres-schema-contribution.md`
- Blocked by `issues/008-auth-repository-ports-for-persistence-failures.md`

## User stories addressed

- User story 9
- User story 22
- User story 24
- User story 33
- User story 38
- User story 40
- User story 51
- User story 53

## Progress notes

- Added `GymUserRegistrationRepositoryPostgresAdapter` as the first database-backed auth repository slice. It depends on the shared `DrizzleDatabase` service, wraps query failures as `PersistenceError`, maps rows into auth domain records explicitly, stores normalized email values, and uses `token_digest` columns for token/session lookup fields.
- Added a repository behavior test covering durable save plus normalized email lookup through the repository service layer with a fake Drizzle database.
- Added `SystemAdminBootstrapRepositoryPostgresAdapter`, exported it through an explicit auth package subpath, and covered first-admin save, normalized email lookup, credential lookup, and session token-digest lookup through the repository boundary.
- Remaining work: add Postgres adapters/tests for gym repository and staff invitations, broader token/session digest lookup coverage, database constraints, and true restart durability against a live database.
