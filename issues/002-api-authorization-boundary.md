## Parent PRD

`issues/prd.md`

## What to build

Add an explicit API authorization boundary at the HTTP edge. Public auth endpoints should be intentionally allowlisted, protected endpoints should require valid session transport by default, and tests should prove anonymous callers cannot access protected API behavior.

## Acceptance criteria

- [ ] The API edge defines a clear route authorization policy that defaults protected behavior to requiring valid auth.
- [ ] Public Auth endpoints needed for account creation and activation remain reachable without a session, including signup, email reservation, email verification, and login.
- [ ] Protected Auth endpoints require valid session transport before invoking protected behavior.
- [ ] API tests verify anonymous requests fail for protected routes and allowed public routes remain callable.
- [ ] The authorization boundary is implemented outside the Auth domain model so transport and edge policy do not leak into Auth facade use cases.

## Blocked by

- Blocked by `issues/001-composed-kryno-api-shell.md`

## User stories addressed

- User story 20
- User story 21
- User story 23
- User story 25
- User story 26
- User story 28
