## Parent PRD

`issues/prd.md`

## What to build

Add the gym creation request and system-admin approval flow. A verified gym-side user should be able to request a gym, and a system admin should be able to approve it into an active gym with the requester assigned as Owner.

## Acceptance criteria

- [ ] A verified gym-side user can create a pending gym request.
- [ ] Unverified gym-side users cannot create gym requests.
- [ ] A system admin can approve a pending gym request.
- [ ] Approval activates the gym and assigns the requester as Owner.
- [ ] Gym-scoped access policies treat active gym status as required for Owner privileges.
- [ ] Schema-backed Effect HTTP API endpoint contracts exist for gym request creation and system-admin approval.
- [ ] Endpoints are registered in the auth HTTP group and wired through auth HTTP handlers to the public `Auth` facade.
- [ ] Endpoint contracts expose typed success and expected gym-user session, admin session, unverified-user, and invalid-request error responses with appropriate HTTP statuses.
- [ ] Tests or typechecks cover endpoint contract/handler wiring for representative request, approval, and authorization-denial paths.
- [ ] Behavior tests cover request creation, unverified denial, admin approval, Owner assignment, and active-gym access.

## Blocked by

- Blocked by `issues/003-admin-login-current-session-logout.md`
- Blocked by `issues/005-gym-user-login-current-session-logout.md`

## User stories addressed

- User story 6
- User story 20
- User story 21
- User story 22
- User story 31
- User story 32
- User story 33
- User story 35
- User story 39
- User story 40
- User story 41
- User story 42
- User story 43
