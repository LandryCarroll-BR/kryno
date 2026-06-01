## Parent PRD

`issues/prd.md`

## What to build

Add the password reset completion frontend use case using the existing auth API. Users should be able to open a reset link with a token, edit the token if needed, enter a new password, and return to login after success.

## Acceptance criteria

- [ ] A standalone password reset completion route and form are available.
- [ ] The token field is prefilled from the query string when present and remains editable.
- [ ] The form validates token and new password input before calling the API.
- [ ] Successful completion redirects to login with a password-reset-complete status.
- [ ] Invalid, expired, already-used, and user-not-found reset failures are shown as expected form failures.
- [ ] Unexpected failures are not swallowed.
- [ ] The use case has focused action/view-model tests following existing auth test style.
- [ ] Web tests and typecheck pass for this slice.

## Blocked by

- Blocked by `issues/001-login-return-targets-and-auth-statuses.md`

## User stories addressed

- User story 6
- User story 7
- User story 8
- User story 9
- User story 10
- User story 11
- User story 44
- User story 48
- User story 49
- User story 50
- User story 51
- User story 52
