## Parent PRD

`auth-issues/prd.md`

## What to build

Update the web logout flow so Kryno Web reads its session cookie, calls the Core API logout route with bearer authentication, and then clears the web-owned browser cookie. Logout should leave both the browser cookie and server-side session unusable.

## Acceptance criteria

- [ ] The logout action reads the web-owned session cookie server-side.
- [ ] The web API client calls Core API gym-user logout with `Authorization: Bearer <sessionId>`.
- [ ] Successful logout invalidates the authenticated server-side session.
- [ ] The web app clears its own session cookie regardless of whether the Core API sets cookie headers.
- [ ] Successful logout redirects to the login screen.
- [ ] Refreshes and direct visits to protected routes after logout redirect to login.
- [ ] Web API client and route tests verify bearer logout forwarding, cookie clearing, and post-logout protected-route rejection.

## Blocked by

- Blocked by `auth-issues/001-gym-user-current-session-and-logout-bearer-routes.md`
- Blocked by `auth-issues/005-web-login-owns-host-only-session-cookie.md`
- Blocked by `auth-issues/006-protected-web-loaders-forward-cookie-as-bearer.md`

## User stories addressed

- User story 4
- User story 5
- User story 15
- User story 16
- User story 17
- User story 20
- User story 23

