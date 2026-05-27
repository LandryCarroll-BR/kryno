## Parent PRD

`issues/prd.md`

## What to build

Add Owner-controlled Staff invitation behavior. An active gym Owner should be able to invite Staff, and invited users should be able to accept Staff access for that gym. Users must not be able to self-assign Staff privileges.

## Acceptance criteria

- [ ] An active gym Owner can create a Staff invitation.
- [ ] Staff invitation delivery is represented through an email/notification service port.
- [ ] An invited gym-side user can accept the invitation and receive Staff access for that gym.
- [ ] Non-Owners cannot invite Staff.
- [ ] Users cannot self-assign Staff access.
- [ ] Pending or inactive gyms do not grant Staff access.
- [ ] Behavior tests cover invitation, acceptance, non-owner denial, self-assignment denial, and inactive-gym denial.

## Blocked by

- Blocked by `issues/007-gym-request-admin-approval.md`

## User stories addressed

- User story 23
- User story 24
- User story 25
- User story 26
- User story 31
- User story 32
- User story 33
- User story 35
- User story 37
- User story 38
- User story 39
- User story 41
- User story 42
- User story 43
