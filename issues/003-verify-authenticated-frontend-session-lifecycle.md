## Parent PRD

`issues/prd.md`

## What to build

Verify the authenticated frontend lifecycle across the separate API boundary. This slice should prove protected app loading and logout continue to work when the web app talks to the local API server, especially the bearer-token session behavior and cookie non-forwarding decisions captured in the PRD.

## Acceptance criteria

- [ ] Protected app loading uses the web session cookie only to recover the session id.
- [ ] Current-session API requests are sent to the configured API base URL with bearer authorization.
- [ ] Current-session API requests do not forward browser cookies to the API server.
- [ ] Logout requests are sent to the configured API base URL with bearer authorization.
- [ ] Logout clears the web-owned browser session cookie even when the API session is already invalid.
- [ ] Expected session failures redirect back to login.
- [ ] Lightweight local development instructions are added if the API and web package scripts do not make the two-server setup obvious.
- [ ] Existing app loader, logout, and API client tests continue to pass.

## Blocked by

- Blocked by `issues/001-add-effect-backed-local-api-dev-server.md`
- Blocked by `issues/002-verify-web-client-targets-separate-api-server.md`

## User stories addressed

- User story 15
- User story 16
- User story 17
- User story 18
- User story 19
- User story 22
- User story 23
