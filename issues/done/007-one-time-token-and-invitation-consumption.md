## Parent PRD

`issues/prd.md`

## What to build

Make verification tokens, password reset tokens, sessions, and staff invitations reject replay after use or revocation. Preserve product-facing staff invitation status while adding clearer consumed/accepted/revoked timestamps where the PRD calls for them.

## Acceptance criteria

- [ ] Used email verification tokens are rejected on replay.
- [ ] Used password reset tokens are rejected on replay.
- [ ] Logout revokes the current gym user session so the cookie can no longer authenticate requests.
- [ ] Accepted staff invitations are rejected on reuse.
- [ ] Staff invitation acceptance matches invited email case-insensitively.
- [ ] Application-boundary tests cover replay/revocation behavior for applicable flows.
- [ ] Existing deterministic adapters remain usable for fast tests.

## Blocked by

- Blocked by `issues/005-secure-auth-primitives.md`
- Blocked by `issues/006-token-and-session-expiration-behavior.md`

## User stories addressed

- User story 27
- User story 29
- User story 31
- User story 36
- User story 37
- User story 56
- User story 57
- User story 58
