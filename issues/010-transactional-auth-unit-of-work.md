## Parent PRD

`issues/prd.md`

## What to build

Add an auth-facing transaction or unit-of-work boundary backed by the shared Drizzle transaction support. Use it for auth multi-write flows so related writes commit or fail atomically while memory/test adapters can remain no-op or deterministic.

## Acceptance criteria

- [ ] Auth exposes a transaction/unit-of-work port or equivalent application boundary suitable for multi-write use cases.
- [ ] Database-backed implementation delegates to `DrizzleDatabase` transaction support.
- [ ] Test/memory implementations preserve fast deterministic behavior.
- [ ] Signup creates user, credential, and verification token atomically.
- [ ] Password reset completion updates credentials and consumes the token atomically.
- [ ] Staff invitation acceptance creates affiliation and marks the invitation accepted atomically.
- [ ] Gym creation approval updates request, gym activation, and owner affiliation atomically.
- [ ] First system admin bootstrap creates admin and credentials atomically.
- [ ] Integration tests verify rollback for at least representative multi-write failures.

## Blocked by

- Blocked by `issues/002-shared-drizzle-effect-package.md`
- Blocked by `issues/008-auth-repository-ports-for-persistence-failures.md`
- Blocked by `issues/009-database-backed-auth-repositories.md`

## User stories addressed

- User story 42
- User story 43
- User story 44
- User story 45
- User story 46
- User story 47
