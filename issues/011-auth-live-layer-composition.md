## Parent PRD

`issues/prd.md`

## What to build

Compose the auth module's live layer from production repository adapters, secure service adapters, token/session hashing, transaction support, and a non-production email adapter unless a provider is added later. Preserve smaller constituent layers for testability and overrides.

## Acceptance criteria

- [ ] Auth exports one convenient live layer for application wiring.
- [ ] Auth also exports smaller constituent layers for repository/service overrides in tests.
- [ ] The live layer includes database-backed repositories, secure password hashing, secure ID/token generation, token/session hashing, and transaction support.
- [ ] The live layer uses a non-production email delivery adapter unless production email is explicitly added elsewhere.
- [ ] Existing mock/test layers remain available and continue to support fast module tests.
- [ ] Signup and authentication flows can run through the auth facade using the live layer.

## Blocked by

- Blocked by `issues/005-secure-auth-primitives.md`
- Blocked by `issues/009-database-backed-auth-repositories.md`
- Blocked by `issues/010-transactional-auth-unit-of-work.md`

## User stories addressed

- User story 9
- User story 11
- User story 12
- User story 24
- User story 25
- User story 32
- User story 33
