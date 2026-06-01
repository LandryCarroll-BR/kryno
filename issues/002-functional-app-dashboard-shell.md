## Parent PRD

`issues/prd.md`

## What to build

Turn `/app` into a functional gym-user dashboard shell using the existing current-session API response. The page should show the signed-in account, active affiliations using the available gym ID and role data, status messages, and placeholders/composition points for the separated use-case forms that will be added in later slices.

## Acceptance criteria

- [ ] `/app` continues to require a valid gym-user session cookie.
- [ ] `/app` displays the current user's identity.
- [ ] `/app` displays active affiliations using the existing API fields.
- [ ] `/app` clearly handles the empty-affiliations state.
- [ ] `/app` can map known status and error query params into functional user-facing messages.
- [ ] Existing unauthenticated and invalid-session redirects remain covered by tests.
- [ ] Web tests and typecheck pass for this slice.

## Blocked by

None - can start immediately

## User stories addressed

- User story 15
- User story 16
- User story 17
- User story 18
- User story 42
- User story 45
- User story 47
- User story 53
- User story 55
- User story 59
- User story 60
