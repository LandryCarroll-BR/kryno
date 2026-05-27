## Parent PRD

`issues/prd.md`

## What to build

Add password reset behavior for gym-side users. Users should be able to request a reset token and complete a password reset using a valid, unexpired, single-use token.

## Acceptance criteria

- [ ] A password reset request creates a reset token for an existing gym-side user.
- [ ] Reset token delivery is represented through an email/notification service port.
- [ ] Completing a reset replaces the user's password credential.
- [ ] Reset tokens expire.
- [ ] Reset tokens are single-use.
- [ ] Behavior tests cover request, completion, expiration, replay denial, and unknown-email behavior.

## Blocked by

- Blocked by `issues/004-gym-user-signup-email-verification.md`

## User stories addressed

- User story 16
- User story 17
- User story 18
- User story 33
- User story 35
- User story 36
- User story 37
- User story 38
- User story 39
- User story 42
- User story 43
