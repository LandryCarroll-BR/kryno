## Parent PRD

`issues/prd.md`

## What to build

Add fixed expiration behavior for email verification tokens, password reset tokens, staff invitations, gym user sessions, and system admin sessions. The behavior should remain testable with Effect Clock/TestClock and should make expired records logically invalid without adding cleanup jobs.

## Acceptance criteria

- [x] Email verification tokens expire after the PRD's configured fixed lifetime.
- [x] Password reset tokens expire after the PRD's configured fixed lifetime.
- [x] Staff invitation tokens expire after the PRD's configured fixed lifetime.
- [x] Gym user sessions expire after the PRD's configured fixed lifetime.
- [x] System admin sessions expire faster than gym user sessions.
- [x] Application-boundary tests cover expired token/session behavior using Effect TestClock where applicable.
- [x] Expired records are rejected but no cleanup/archive job is added.
- [x] Tests avoid relying on exact deterministic token/session strings where secure generation is involved.

## Blocked by

- Blocked by `issues/005-secure-auth-primitives.md`

## User stories addressed

- User story 26
- User story 28
- User story 30
- User story 35
- User story 39
- User story 56
- User story 57
- User story 58
