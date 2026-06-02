## Parent PRD

`issues/prd.md`

## What to build

Add the create-staff-invitation frontend use case. `/app` should render the owner-oriented invitation form, but the form should submit to a dedicated route action owned by this use case. The action should use the gym-user session cookie, call the existing auth API, and redirect back to `/app`.

## Acceptance criteria

- [ ] `/app` renders a functional staff invitation form with manual gym ID and email fields.
- [ ] The form submits to a dedicated route action for this use case.
- [ ] The action redirects unauthenticated users to login with an `/app` return target.
- [ ] The action validates gym ID and email input before calling the API.
- [ ] Valid submissions call the existing create-staff-invitation API using the session cookie.
- [ ] Successful submissions redirect to `/app` with a staff-invitation-created status.
- [ ] Expected owner-access, inactive-gym, self-assignment, session-invalid, and unverified failures redirect back to `/app` with useful error status.
- [ ] Unexpected failures are not swallowed.
- [ ] The use case has focused action/view-model tests following existing auth test style.
- [ ] Web tests and typecheck pass for this slice.

## Blocked by

- Blocked by `issues/001-login-return-targets-and-auth-statuses.md`
- Blocked by `issues/002-functional-app-dashboard-shell.md`

## User stories addressed

- User story 30
- User story 31
- User story 32
- User story 33
- User story 34
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
- User story 57
- User story 58
