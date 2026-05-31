## Parent PRD

`auth-issues/prd.md`

## What to build

Update the gym creation request and approval HTTP flows so protected request payloads no longer contain client-supplied session identity. A gym user should request gym creation with only the business details, and a system admin should approve a request with only the approval details, while handlers inject the authenticated bearer session id into the existing application inputs.

## Acceptance criteria

- [ ] `requestGymCreation` payload schemas exclude `sessionId`.
- [ ] `approveGymCreationRequest` payload schemas exclude `sessionId`.
- [ ] The gym-user request route requires a valid gym-user bearer credential and rejects missing, invalid, or system-admin credentials.
- [ ] The approval route requires a valid system-admin bearer credential and rejects missing, invalid, or gym-user credentials.
- [ ] Handlers preserve the existing Auth facade/application inputs internally by adding the trusted session id at the HTTP boundary.
- [ ] Contract and composed API tests verify bearer-only authentication, wrong-audience rejection, and absence of `sessionId` in protected payload contracts.

## Blocked by

None - can start immediately

## User stories addressed

- User story 7
- User story 8
- User story 9
- User story 12
- User story 13
- User story 20
- User story 21
- User story 22
- User story 28
- User story 29

