## Parent PRD

`issues/prd.md`

## What to build

Update auth repository port error types and HTTP boundary mapping so persistence failures are visible in Effect types inside the module while API clients receive generic server errors rather than auth-business errors.

## Acceptance criteria

- [ ] Auth repository ports include typed persistence failures where database-backed implementations can fail.
- [ ] Persistence failures carry operation context through the shared `PersistenceError`.
- [ ] Interactors continue to expose auth business errors distinctly from infrastructure failures.
- [ ] HTTP handlers map persistence failures to generic server errors.
- [ ] Existing memory-backed repository tests remain fast and deterministic.

## Blocked by

- Blocked by `issues/002-shared-drizzle-effect-package.md`

## User stories addressed

- User story 22
- User story 23
- User story 48
- User story 49
- User story 50
