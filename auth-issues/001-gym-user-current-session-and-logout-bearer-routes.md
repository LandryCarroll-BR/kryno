## Parent PRD

`auth-issues/prd.md`

## What to build

Refactor the gym-user current-session and logout Core API routes so they operate on the authenticated bearer session instead of a client-supplied `sessionId` route parameter. The HTTP contract should expose singular current-session/logout behavior for the authenticated gym user while the handler injects the trusted session id into the existing Auth facade calls.

## Acceptance criteria

- [ ] `currentGymUserSession` uses a singular authenticated route with no `:sessionId` path parameter.
- [ ] `logoutGymUser` uses a singular authenticated route with no `:sessionId` path parameter.
- [ ] Both routes require gym-user bearer authentication and reject missing, invalid, or system-admin bearer credentials.
- [ ] Handlers derive the `GymUserSessionId` from trusted bearer transport before calling the Auth facade.
- [ ] Login still returns the existing gym-user session DTO and the Core API does not set or clear browser cookies.
- [ ] Contract and behavior tests verify the new routes, removal of old `:sessionId` routes, current-session resolution, and logout invalidation through bearer headers.

## Blocked by

None - can start immediately

## User stories addressed

- User story 7
- User story 9
- User story 10
- User story 11
- User story 12
- User story 14
- User story 15
- User story 18
- User story 20
- User story 21
- User story 22
- User story 28
- User story 29

