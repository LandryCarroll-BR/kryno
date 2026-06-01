## Parent PRD

`issues/prd.md`

## What to build

Add the accept-staff-invitation frontend use case. The standalone acceptance page should require an authenticated gym-user session, preserve the invitation URL through login, prefill but allow editing the token, and submit through a confirmation form to the existing auth API.

## Acceptance criteria

- [ ] A standalone staff invitation acceptance route and confirmation form are available.
- [ ] Unauthenticated visitors are redirected to login with the full invitation URL preserved as a safe return target.
- [ ] The token field is prefilled from the query string when present and remains editable.
- [ ] The form validates token input before calling the API.
- [ ] Valid submissions call the existing accept-staff-invitation API using the session cookie.
- [ ] Successful submissions redirect to `/app` with a staff-invitation-accepted status.
- [ ] Expected invalid-token, inactive-gym, self-assignment, session-invalid, and unverified failures are shown or redirected as useful expected failures.
- [ ] Unexpected failures are not swallowed.
- [ ] The use case has focused loader/action/view-model tests following existing auth test style.
- [ ] Web tests and typecheck pass for this slice.

## Blocked by

- Blocked by `issues/001-login-return-targets-and-auth-statuses.md`
- Blocked by `issues/002-functional-app-dashboard-shell.md`

## User stories addressed

- User story 35
- User story 36
- User story 37
- User story 38
- User story 39
- User story 40
- User story 41
- User story 44
- User story 46
- User story 48
- User story 49
- User story 50
- User story 51
- User story 52
