## Parent PRD

`issues/prd.md`

## What to build

Implement the shared login return-target and auth-status behavior needed by the remaining frontend auth use cases. A successful login should redirect to a safe same-app `redirectTo` path when present, otherwise to `/app`. Unsafe redirect targets should fall back to `/app`. Login should also be able to display status messaging such as password-reset completion.

## Acceptance criteria

- [ ] Successful gym-user login redirects to a safe same-app `redirectTo` path when provided.
- [ ] Successful gym-user login falls back to `/app` when `redirectTo` is missing, empty, external, protocol-relative, or otherwise unsafe.
- [ ] Login can render a password-reset-complete status from query params.
- [ ] Protected auth actions can redirect unauthenticated users to login with an app return target.
- [ ] Existing login behavior, session cookie behavior, and validation behavior remain covered by tests.
- [ ] Web tests and typecheck pass for this slice.

## Blocked by

None - can start immediately

## User stories addressed

- User story 10
- User story 11
- User story 12
- User story 13
- User story 14
- User story 46
- User story 49
- User story 50
- User story 51
- User story 52
