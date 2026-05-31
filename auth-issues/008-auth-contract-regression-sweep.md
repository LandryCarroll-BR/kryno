## Parent PRD

`auth-issues/prd.md`

## What to build

Add a final regression sweep across Auth HTTP contract tests, composed Core API tests, and web auth tests to ensure the new bearer-only Core API and web-owned cookie model is consistently enforced. This slice should remove stale expectations for old route parameters, protected payload `sessionId` fields, and Core API browser cookie ownership.

## Acceptance criteria

- [ ] Auth HTTP reflection tests assert that old `:sessionId` current-session and logout routes are absent.
- [ ] Auth HTTP reflection tests assert that protected payload schemas do not expose client-supplied `sessionId`.
- [ ] Composed Core API tests use bearer headers rather than body or route session ids for protected Auth behavior.
- [ ] Web tests cover login cookie creation, protected cookie-to-bearer forwarding, and logout cookie clearing.
- [ ] Tests verify wrong-audience bearer credentials are rejected for gym-user and system-admin protected routes.
- [ ] Stale tests that only verify legacy cookie forwarding or old session-id route shapes are removed or rewritten.

## Blocked by

- Blocked by `auth-issues/001-gym-user-current-session-and-logout-bearer-routes.md`
- Blocked by `auth-issues/002-system-admin-current-session-and-logout-bearer-routes.md`
- Blocked by `auth-issues/003-gym-creation-actions-use-bearer-derived-sessions.md`
- Blocked by `auth-issues/004-gym-affiliation-actions-use-bearer-derived-sessions.md`
- Blocked by `auth-issues/005-web-login-owns-host-only-session-cookie.md`
- Blocked by `auth-issues/006-protected-web-loaders-forward-cookie-as-bearer.md`
- Blocked by `auth-issues/007-web-logout-invalidates-bearer-session-and-clears-cookie.md`

## User stories addressed

- User story 12
- User story 13
- User story 20
- User story 21
- User story 22
- User story 23
- User story 24
- User story 28
- User story 29
- User story 30

