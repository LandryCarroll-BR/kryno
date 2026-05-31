## Parent PRD

`auth-issues/prd.md`

## What to build

Update protected web loaders so Kryno Web reads its HTTP-only session cookie server-side and calls the Core API with `Authorization: Bearer <sessionId>`. Browser JavaScript should never need direct access to the session credential, and protected pages should reject missing or invalid sessions.

## Acceptance criteria

- [ ] The protected `/app` loader reads the web-owned session cookie on the server.
- [ ] The web API client can call the Core API current gym-user session route with an `Authorization: Bearer <sessionId>` header.
- [ ] Valid cookies preserve the authenticated session across refreshes and direct visits.
- [ ] Missing, invalid, or expired cookies redirect unauthenticated visitors to the gym-user login screen.
- [ ] The loader does not forward browser cookies directly to the Core API as Core API cookie auth.
- [ ] Web API client and route tests verify cookie-to-bearer forwarding, authenticated rendering, and unauthenticated redirects.

## Blocked by

- Blocked by `auth-issues/001-gym-user-current-session-and-logout-bearer-routes.md`
- Blocked by `auth-issues/005-web-login-owns-host-only-session-cookie.md`

## User stories addressed

- User story 2
- User story 3
- User story 6
- User story 12
- User story 16
- User story 17
- User story 18
- User story 20
- User story 23

