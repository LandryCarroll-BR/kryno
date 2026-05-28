## Parent PRD

`issues/prd.md`

## What to build

Build the first gym-user signup path in the React app. This includes one request-scoped Kryno API client module for React Router loaders/actions and a signup route/action that submits through the composed API, shows expected failures inline, and redirects successful users to manual email verification.

## Acceptance criteria

- [ ] The web app has one typed Kryno API client module used by route loaders and actions instead of ad hoc per-route clients.
- [ ] A gym-user signup screen collects email, password, and display name using shadcn/ui form primitives.
- [ ] The signup action calls the API client and treats expected validation, duplicate email, and reserved email failures as action data.
- [ ] Expected signup failures render inline without throwing route error boundaries.
- [ ] Successful signup redirects the user to the manual email verification screen.
- [ ] Web app typechecks or route-level tests verify the signup action uses the shared API client and returns inline action errors for expected failures.

## Blocked by

- Blocked by `issues/001-composed-kryno-api-shell.md`

## User stories addressed

- User story 1
- User story 2
- User story 3
- User story 4
- User story 16
- User story 18
- User story 19
- User story 30
