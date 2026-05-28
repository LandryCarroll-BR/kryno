## Parent PRD

`issues/prd.md`

## What to build

Update the gym-user Auth HTTP edge so browser clients use an HTTP-only session cookie while future clients can continue using bearer session IDs. Login should still return the session DTO, current-session and logout should resolve session IDs from transport, and logout should clear the browser cookie.

## Acceptance criteria

- [ ] Gym-user login returns the existing session DTO and sets the appropriate HTTP-only gym-user session cookie for browser clients.
- [ ] Current gym-user session can resolve the session from the gym-user session cookie.
- [ ] Current gym-user session can resolve the session from `Authorization: Bearer <sessionId>`.
- [ ] Gym-user logout invalidates the session through the Auth facade and clears the gym-user session cookie.
- [ ] Session transport remains an HTTP edge concern; Auth facade use cases continue to operate on session IDs.
- [ ] Auth HTTP API tests cover login DTO plus cookie behavior, current-session cookie and bearer behavior, missing-session failures, and logout cookie clearing.

## Blocked by

- Blocked by `issues/002-api-authorization-boundary.md`

## User stories addressed

- User story 23
- User story 24
- User story 28
