## Parent PRD

`issues/prd.md`

## What to build

Add the system-admin bootstrap flow. The auth module should be able to create the first admin through a controlled, idempotent use case without open admin registration.

## Acceptance criteria

- [x] The auth module models system-admin identity separately from gym-side identity.
- [x] A bootstrap use case creates the first system admin with email and password credentials.
- [x] Running bootstrap again does not create duplicate first-admin accounts.
- [x] The flow returns typed success and recoverable error results.
- [x] Behavior tests cover first-admin creation, idempotency, and duplicate prevention.

## Blocked by

- Blocked by `issues/001-scaffold-auth-package.md`

## User stories addressed

- User story 3
- User story 4
- User story 5
- User story 10
- User story 33
- User story 35
- User story 39
- User story 42
- User story 43
