## Parent PRD

`issues/prd.md`

## What to build

Add production-ready auth primitives for secure password hashing, cryptographically secure IDs/tokens, token/session hashing at rest, secure cookie settings where auth currently issues cookies, and normalized email identity. Keep deterministic test adapters available so existing fast behavior tests remain predictable.

## Acceptance criteria

- [ ] Production password hashing uses Argon2id or bcrypt through the existing service-port pattern.
- [ ] Production ID and token generation uses cryptographically secure randomness.
- [ ] Token and session digests use HMAC-SHA-256 with a required live auth secret.
- [ ] Raw bearer tokens are kept separate from internal session row IDs.
- [ ] Email normalization is available through a small identity helper/primitive and supports case-insensitive uniqueness and lookup.
- [ ] Existing deterministic/sequential test adapters remain available.
- [ ] Tests assert secure primitive behavior by shape and behavior rather than exact production token strings.
- [ ] Existing web/API cookie handling uses secure and HTTP-only settings where appropriate for the current runtime.

## Blocked by

None - can start immediately

## User stories addressed

- User story 21
- User story 25
- User story 32
- User story 33
- User story 34
- User story 38
- User story 57
- User story 58
