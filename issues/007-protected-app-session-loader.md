## Parent PRD

`issues/prd.md`

## What to build

Add the first protected `/app` dashboard shell. Its React Router server loader should resolve the current gym-user session through the shared API client using trusted browser cookies, render authenticated UI from that server-loaded session, and redirect unauthenticated visitors to login.

## Acceptance criteria

- [ ] The web app defines a protected `/app` route with a minimal authenticated dashboard shell.
- [ ] The `/app` loader calls the shared Kryno API client to load the current gym-user session on the server.
- [ ] Browser cookies from the incoming request are forwarded to the API client for current-session loading.
- [ ] Unauthenticated or invalid sessions redirect to the gym-user login screen.
- [ ] Valid sessions persist across page refreshes and direct visits to `/app`.
- [ ] Web app typechecks or route-level tests verify trusted server session loading, cookie forwarding, and unauthenticated redirects.

## Blocked by

- Blocked by `issues/003-gym-user-session-transport.md`
- Blocked by `issues/006-gym-user-login-screen.md`

## User stories addressed

- User story 10
- User story 12
- User story 13
- User story 16
- User story 29
- User story 30
