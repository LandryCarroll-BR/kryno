## Parent PRD

`issues/prd.md`

## What to build

Add schema-backed Effect HTTP API contracts over the completed auth use cases. These should validate input/output shapes, register endpoints in the auth HTTP group, and provide thin handler wiring to the public `Auth` facade without implementing web app routes, UI, cookies, production server wiring, or persistence.

## Acceptance criteria

- [ ] Schema-backed Effect HTTP API endpoint contracts exist for admin bootstrap, admin login/logout/current session, gym-side signup/verification/login/logout/current session, password reset, gym request/approval, member join/leave, and Staff invitation.
- [ ] Endpoints are registered in the auth HTTP group and wired through auth HTTP handlers to the public `Auth` facade.
- [ ] Endpoint contracts expose typed success and expected domain error responses with appropriate HTTP statuses.
- [ ] No React Router/web app routes, API clients, cookie adapter, production server wiring, or database adapter is introduced.
- [ ] Behavior tests or typechecks cover representative endpoint contract/handler success and failure paths without coupling to implementation details.

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
