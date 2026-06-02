## Parent PRD

`issues/prd.md`

## What to build

Define the auth module's Postgres schema contribution and expose it through an intentional schema subpath for database composition. The schema should represent the auth persistence model, module-owned database schema, timestamps, constraints, and future-friendly system-admin shape described in the PRD.

## Acceptance criteria

- [x] Auth table definitions live with the auth module and are not exported through the main auth facade.
- [x] A schema-only subpath exports auth schema contributions for the product database composition module.
- [x] Auth tables use a module-specific Postgres schema named `auth`.
- [x] Timestamps are stored as `timestamptz`.
- [x] Database constraints mirror core auth invariants, including normalized email uniqueness, unique token/session digests, one credential per account, one affiliation per gym/user, valid status/role values, and module-internal foreign keys.
- [x] The system admin schema permits multiple system admins even if bootstrap still creates only the first admin.
- [x] Cross-module foreign keys are avoided unless ownership is clearly stable.
- [x] The schema is reviewed for ownership boundaries and future migration cost before downstream repository work proceeds.

## Blocked by

- Blocked by `issues/003-product-database-composition-module.md`

## User stories addressed

- User story 7
- User story 8
- User story 20
- User story 23
- User story 40
- User story 41
- User story 51
- User story 52
- User story 53
- User story 54
