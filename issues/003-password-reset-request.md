## Parent PRD

`issues/prd.md`

## What to build

Add the password reset request frontend use case using the existing auth API. Signed-out users should be able to enter an email address and receive a privacy-preserving confirmation message regardless of whether the account exists.

## Acceptance criteria

- [ ] A standalone password reset request route and form are available to signed-out users.
- [ ] The form validates email input before calling the API.
- [ ] Valid submissions call the existing password reset request API with normalized input.
- [ ] Known-email and unknown-email API responses produce the same success confirmation.
- [ ] Unexpected failures are not swallowed.
- [ ] The login page links to the password reset request route where appropriate.
- [ ] The use case has focused action/view-model tests following existing auth test style.
- [ ] Web tests and typecheck pass for this slice.

## Blocked by

None - can start immediately

## User stories addressed

- User story 1
- User story 2
- User story 3
- User story 4
- User story 5
- User story 44
- User story 48
- User story 49
- User story 50
- User story 51
- User story 52
