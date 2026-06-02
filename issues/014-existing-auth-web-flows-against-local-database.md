## Parent PRD

`issues/prd.md`

## What to build

Verify the existing web/API auth flows end to end against the local Postgres-backed runtime. This milestone should not add new web UX, but current signup, login, logout, verification, password reset, invitation, gym request, and bootstrap flows should continue working with live persistence.

## Acceptance criteria

- [ ] Existing auth web flows continue to work end to end with the API wired to local Postgres.
- [ ] No new auth screens or broad web UX changes are added.
- [ ] End-to-end or equivalent integration coverage verifies representative existing auth flows against the local database.
- [ ] Tests or manual verification cover durable persistence across API restart for at least signup/login state.
- [ ] The final workflow documents how to run local Postgres, migrations, API, web, and database-backed auth verification.

## Blocked by

- Blocked by `issues/012-database-integration-test-command.md`
- Blocked by `issues/013-api-live-persistence-wiring.md`

## User stories addressed

- User story 13
- User story 24
- User story 59
- User story 60
