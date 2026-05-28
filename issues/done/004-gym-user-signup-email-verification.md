## Parent PRD

`issues/prd.md`

## What to build

Add gym-side account signup and email verification. Gym-side users should be able to create accounts with email, password, and display name, then verify their email before receiving authenticated app access.

## Acceptance criteria

- [ ] Gym-side user identity is modeled separately from system-admin identity.
- [ ] Gym-side signup creates an unverified user with password credentials.
- [ ] Signup emits an email verification token through service ports.
- [ ] Verification marks the gym-side user as verified.
- [ ] The same email can exist once in the admin namespace and once in the gym-side namespace.
- [ ] Duplicate emails are rejected within the gym-side namespace.
- [ ] Schema-backed Effect HTTP API endpoint contracts exist for gym-side signup/email reservation and email verification.
- [ ] Endpoints are registered in the auth HTTP group and wired through auth HTTP handlers to the public `Auth` facade.
- [ ] Endpoint contracts expose typed success and expected duplicate-email or verification error responses with appropriate HTTP statuses.
- [ ] Tests or typechecks cover endpoint contract/handler wiring for representative signup, verification, and duplicate-email paths.
- [ ] Behavior tests cover signup, verification, duplicate handling, and cross-namespace email separation.

## Blocked by

- Blocked by `issues/001-scaffold-auth-package.md`

## User stories addressed

- User story 11
- User story 12
- User story 13
- User story 19
- User story 33
- User story 35
- User story 36
- User story 37
- User story 38
- User story 39
- User story 42
- User story 43
