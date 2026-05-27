## Parent PRD

`issues/prd.md`

## What to build

Add DTO-facing controller contracts over the completed auth use cases. These should validate input/output shapes and provide a stable surface for future HTTP handlers without implementing routes, UI, cookies, or persistence.

## Acceptance criteria

- [ ] Controller contracts exist for admin bootstrap, admin login/logout/current session, gym-side signup/verification/login/logout/current session, password reset, gym request/approval, member join/leave, and Staff invitation.
- [ ] Controller inputs and outputs are schema-backed.
- [ ] Controller contracts map use-case success and typed errors into stable DTO-facing results.
- [ ] No HTTP routes, React UI, cookie adapter, or database adapter is introduced.
- [ ] Behavior tests cover representative controller success and failure paths without coupling to implementation details.

## Blocked by

- Blocked by `issues/003-admin-login-current-session-logout.md`
- Blocked by `issues/005-gym-user-login-current-session-logout.md`
- Blocked by `issues/006-gym-user-password-reset.md`
- Blocked by `issues/007-gym-request-admin-approval.md`
- Blocked by `issues/008-member-self-join-leave.md`
- Blocked by `issues/009-owner-invites-staff.md`

## User stories addressed

- User story 31
- User story 40
- User story 44
- User story 45
- User story 46
