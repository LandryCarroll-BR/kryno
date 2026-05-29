## Parent PRD

`issues/prd.md`

## What to build

Build the gym-user login flow in the React app. Login should use the shared request-scoped API client, forward any API `Set-Cookie` header from the React Router action response, show expected auth failures inline, and redirect successful users to `/app`.

## Acceptance criteria

- [ ] A gym-user login screen collects email and password using shadcn/ui form primitives.
- [ ] The login action calls the shared Kryno API client and captures the API response headers.
- [ ] The login action forwards session `Set-Cookie` headers from the API response to the browser.
- [ ] Invalid credentials and unverified-user failures render as inline action data without throwing route error boundaries.
- [ ] Successful login redirects the user to `/app`.
- [ ] Web app typechecks or route-level tests verify cookie forwarding, shared API client usage, inline expected errors, and successful redirect behavior.

## Blocked by

- Blocked by `issues/003-gym-user-session-transport.md`
- Blocked by `issues/005-manual-email-verification-screen.md`

## User stories addressed

- User story 7
- User story 8
- User story 9
- User story 11
- User story 17
- User story 18
- User story 19
- User story 24
- User story 30
