## Parent PRD

`issues/prd.md`

## What to build

Add lightweight member affiliation behavior. A verified gym-side user should be able to join and leave any active gym, while pending or inactive gyms should not grant member access.

## Acceptance criteria

- [ ] A verified gym-side user can join an active gym as a Member.
- [ ] A gym-side user can leave a gym they previously joined.
- [ ] Leaving records the affiliation as left rather than requiring deletion.
- [ ] Joining a pending or inactive gym is denied by policy.
- [ ] Current-session or access lookup can reflect active member affiliations.
- [ ] Behavior tests cover join, leave, rejoin where supported, pending/inactive denial, and current-affiliation visibility.

## Blocked by

- Blocked by `issues/007-gym-request-admin-approval.md`

## User stories addressed

- User story 27
- User story 28
- User story 29
- User story 30
- User story 31
- User story 32
- User story 33
- User story 35
- User story 39
- User story 41
- User story 42
- User story 43
- User story 48
