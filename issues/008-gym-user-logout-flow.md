## Parent PRD

`issues/prd.md`

## What to build

Add the gym-user logout flow to the protected app shell. Logout should call the protected API through the shared client, forward cookie-clearing headers back to the browser, and reliably leave refreshes and direct protected visits treated as logged out.

## Acceptance criteria

- [ ] The protected app shell exposes a logout control wired to a React Router action.
- [ ] The logout action calls the shared Kryno API client with the current browser session cookie.
- [ ] The logout action forwards API cookie-clearing `Set-Cookie` headers back to the browser.
- [ ] Successful logout redirects the user to the login screen.
- [ ] Refreshes and direct visits to `/app` after logout redirect to login instead of showing protected UI.
- [ ] Web app typechecks or route-level tests verify cookie forwarding, session invalidation behavior, and post-logout protected-route redirects.

## Blocked by

- Blocked by `issues/007-protected-app-session-loader.md`

## User stories addressed

- User story 14
- User story 15
- User story 17
- User story 29
- User story 30
