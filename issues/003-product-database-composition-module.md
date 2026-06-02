## Parent PRD

`issues/prd.md`

## What to build

Create the product database composition module under `modules/` that assembles module-exported schema contributions into the merged Kryno schema and owns Drizzle config plus generated migrations. This module should be a thin composition module, similar in spirit to the API module, and should not become a business-domain module.

## Acceptance criteria

- [ ] A database composition module exists under `modules/` with a thin facade and explicit composition responsibilities.
- [ ] Drizzle config points at the merged Kryno schema and central generated migrations.
- [ ] Migration generation and migration execution are available through explicit commands.
- [ ] The module composes the shared `DrizzleDatabase` service from `@workspace/drizzle`.
- [ ] Migrations are not run automatically during application startup.

## Blocked by

- Blocked by `issues/002-shared-drizzle-effect-package.md`

## User stories addressed

- User story 2
- User story 3
- User story 6
- User story 10
- User story 55
