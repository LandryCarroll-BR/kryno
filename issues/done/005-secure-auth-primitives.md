## Parent PRD

`issues/prd.md`

## What to build

Add production-ready auth primitives for secure password hashing, cryptographically secure IDs/tokens, token/session hashing at rest, secure cookie settings where auth currently issues cookies, and normalized email identity. Keep deterministic test adapters available so existing fast behavior tests remain predictable.

## Acceptance criteria

- [x] Production password hashing uses Argon2id or bcrypt through the existing service-port pattern.
- [x] Production ID and token generation uses cryptographically secure randomness.
- [x] Token and session digests use HMAC-SHA-256 with a required live auth secret.
- [x] Raw bearer tokens are kept separate from internal session row IDs.
- [x] Email normalization is available through a small identity helper/primitive and supports case-insensitive uniqueness and lookup.
- [x] Existing deterministic/sequential test adapters remain available.
- [x] Tests assert secure primitive behavior by shape and behavior rather than exact production token strings.
- [x] Existing web/API cookie handling uses secure and HTTP-only settings where appropriate for the current runtime.

## Progress note

- Added secure service adapters for Argon2id password hashing, crypto-backed IDs, crypto-backed bearer tokens, and an HMAC-SHA-256 token digester backed by required `AUTH_SECRET` config.
- Added normalized email identity helper and wired gym-user/system-admin/staff-invitation application flows and memory lookup keys to use normalized identity.
- Completed the session-token slice by issuing raw bearer session tokens separately from internal session row IDs, storing only token digests on session records, and resolving protected flows through digest lookup.

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
