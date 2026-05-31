## Parent PRD

`auth-issues/prd.md`

## What to build

Update the gym ownership, membership, and staff invitation HTTP flows so gym-user protected payloads no longer contain client-supplied session identity. Each route should authenticate the gym user through bearer transport and pass the trusted session id into the existing Auth facade calls at the HTTP boundary.

## Acceptance criteria

- [ ] `currentGymOwnerAccess` payload schemas exclude `sessionId`.
- [ ] `joinGymAsMember` and `leaveGymAsMember` payload schemas exclude `sessionId`.
- [ ] `createGymStaffInvitation` and `acceptGymStaffInvitation` payload schemas exclude `sessionId`.
- [ ] Each route requires a valid gym-user bearer credential and rejects missing, invalid, or system-admin bearer credentials.
- [ ] Handlers preserve existing Auth facade/application inputs internally by adding the trusted gym-user session id at the HTTP boundary.
- [ ] Contract and composed API tests verify bearer-only authentication, wrong-audience rejection, and absence of `sessionId` in these protected payload contracts.

## Blocked by

None - can start immediately

## User stories addressed

- User story 7
- User story 9
- User story 12
- User story 13
- User story 20
- User story 21
- User story 22
- User story 28
- User story 29

