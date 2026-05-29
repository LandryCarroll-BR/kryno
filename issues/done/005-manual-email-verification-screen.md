## Parent PRD

`issues/prd.md`

## What to build

Build the manual email verification flow for the initial development environment. The screen should let a gym user enter a verification token, submit it through the shared Kryno API client, show invalid-token feedback inline, and move the user toward login when verification succeeds.

## Acceptance criteria

- [ ] A manual email verification screen accepts the development email verification token using shadcn/ui form primitives.
- [ ] The verification action calls the shared Kryno API client from the React Router action.
- [ ] Invalid or expired token failures render as inline action data without crashing the route error boundary.
- [ ] Successful verification redirects the user to the gym-user login screen.
- [ ] Web app typechecks or route-level tests verify expected verification failures remain action data.

## Blocked by

- Blocked by `issues/004-gym-user-signup-screen.md`

## User stories addressed

- User story 5
- User story 6
- User story 18
- User story 19
- User story 30
