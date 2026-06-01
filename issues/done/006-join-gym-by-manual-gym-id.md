## Parent PRD

`issues/prd.md`

## What to build

Add the join-gym frontend use case using manual gym ID entry. `/app` should render the join form, but the form should submit to a dedicated route action owned by this use case. The action should use the gym-user session cookie, call the existing auth API, and redirect back to `/app`.

## Acceptance criteria

- [ ] `/app` renders a functional join-gym form with a manual gym ID field.
- [ ] The form submits to a dedicated route action for this use case.
- [ ] The action redirects unauthenticated users to login with an `/app` return target.
- [ ] The action validates gym ID input before calling the API.
- [ ] Valid submissions call the existing join-gym-as-member API using the session cookie.
- [ ] Successful submissions redirect to `/app` with a member-joined status.
- [ ] Expected inactive-gym, affiliation-conflict, session-invalid, and unverified failures redirect back to `/app` with useful error status.
- [ ] Unexpected failures are not swallowed.
- [ ] The use case has focused action/view-model tests following existing auth test style.
- [ ] Web tests and typecheck pass for this slice.

## Blocked by

- Blocked by `issues/001-login-return-targets-and-auth-statuses.md`
- Blocked by `issues/002-functional-app-dashboard-shell.md`

## User stories addressed

- User story 24
- User story 25
- User story 26
- User story 42
- User story 43
- User story 44
- User story 46
- User story 47
- User story 48
- User story 49
- User story 50
- User story 51
- User story 52
- User story 55
- User story 56
