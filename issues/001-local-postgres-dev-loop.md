## Parent PRD

`issues/prd.md`

## What to build

Create the local Postgres development loop described in the PRD: Docker Compose for Postgres, non-secret database environment examples, explicit migration/reset commands, and optional Drizzle Studio tooling so developers can run and inspect real persistence locally without changing production code paths.

## Acceptance criteria

- [ ] Docker Compose starts a local Postgres instance suitable for Kryno development.
- [ ] `.env.example` documents `DATABASE_URL` and relevant pool settings without committing secrets.
- [ ] Local scripts or package commands support starting Postgres, resetting local database state, and optionally opening Drizzle Studio.
- [ ] Documentation explains the local database workflow and makes clear that migrations are explicit, not run automatically on app startup.

## Blocked by

None - can start immediately

## User stories addressed

- User story 1
- User story 14
- User story 15
- User story 16
- User story 17
- User story 18
