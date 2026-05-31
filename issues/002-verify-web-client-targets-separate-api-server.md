## Parent PRD

`issues/prd.md`

## What to build

Verify that the web app's existing typed API client and public auth actions target the separate API server through `KRYNO_API_BASE_URL`. This slice should prove the signup, email verification, and login paths use the configured API base URL while preserving the frontend-owned browser session model described in the PRD.

## Acceptance criteria

- [ ] The web API client is verified to send unauthenticated requests to the configured API base URL.
- [ ] Signup behavior is verified against the separate API boundary without changing the existing user-facing flow.
- [ ] Email verification behavior is verified against the separate API boundary without changing the existing user-facing flow.
- [ ] Login behavior is verified to use the API response body for session data rather than relying on API `Set-Cookie` headers.
- [ ] Expected typed API failures remain mapped to existing user-friendly form errors.
- [ ] Unexpected API failures are not swallowed.
- [ ] Existing web API client and auth route tests continue to pass.

## Blocked by

- Blocked by `issues/001-add-effect-backed-local-api-dev-server.md`

## User stories addressed

- User story 10
- User story 11
- User story 12
- User story 13
- User story 14
- User story 17
- User story 18
- User story 19
- User story 22
