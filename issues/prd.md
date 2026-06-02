## Problem Statement

Kryno currently has authentication behavior implemented across the backend and frontend, but the auth module still relies on in-memory test adapters and deterministic service implementations. This prevents realistic end-to-end testing, makes local development diverge from production, and leaves important production auth concerns unresolved, including durable persistence, secure password hashing, secure token/session handling, transactional multi-write flows, and explicit database migration workflows.

The user wants to begin building the persistence layer with Drizzle, Effect, and Postgres. Local development should use Docker Postgres, while production should be able to use a serverless Postgres provider such as Supabase or Neon by changing only the production database connection string and related secrets/configuration. The persistence architecture should stay clean: generic infrastructure belongs in packages, domain modules own their persistence schema contributions and adapters, and apps compose the final runtime.

## Solution

Build a production-ready persistence foundation centered on Drizzle, Effect, and Postgres. Generic Drizzle + Effect utilities will live in the packages workspace, while the product database composition module will assemble module-exported schemas and own migrations. The auth module will define its own Postgres schema contribution, repository adapters, secure service adapters, transaction boundary, and live layer. The API app will switch from test auth wiring to live auth wiring by providing the shared Drizzle database service built from the merged Kryno schema.

Drizzle will own TypeScript schema definitions and generated SQL migrations. Migrations will be explicit scripts/deploy steps, not hidden application startup behavior. Local development will include Docker Postgres, `.env.example` configuration, migration/reset scripts, and optional Drizzle Studio. Automated database tests will be separated from the fast default test command.

Auth persistence will also include business/security improvements that are justified by authentication needs rather than database infrastructure alone: fixed token/session expiration, secure password hashing, cryptographically secure IDs/tokens, token/session hashing at rest, normalized email identity, transaction-scoped multi-write flows, and typed persistence failures.

## User Stories

1. As a developer, I want a local Postgres database for Kryno, so that I can test real persistence during development.
2. As a developer, I want to run explicit database migrations, so that schema changes are reviewed and controlled.
3. As a developer, I want Drizzle to generate migration SQL from TypeScript schema, so that schema and migrations stay aligned.
4. As a developer, I want the production database to work by changing database configuration, so that local and production environments use the same persistence code.
5. As a developer, I want generic Drizzle + Effect utilities in a package, so that domain modules do not own infrastructure mechanics.
6. As a developer, I want a product database composition module, so that all module schema contributions are assembled in one migration source.
7. As a developer, I want auth schema definitions to live with the auth module, so that module ownership remains clear.
8. As a developer, I want the auth schema to be exported through an intentional schema subpath, so that only schema composition code depends on table definitions.
9. As a developer, I want auth repository adapters to depend on a shared Drizzle database service, so that adapters do not construct their own database clients.
10. As a developer, I want one shared database client/pool, so that modules do not create competing database connections.
11. As a developer, I want the API app to compose live auth persistence, so that runtime wiring stays explicit.
12. As a developer, I want memory-backed auth tests to remain available, so that fast behavior tests do not require Postgres.
13. As a developer, I want separate integration test commands for database-backed tests, so that the default test suite stays fast.
14. As a developer, I want Docker Compose for local Postgres, so that I can run the app end to end locally.
15. As a developer, I want a local database reset path, so that I can quickly recover from bad development state.
16. As a developer, I want Drizzle Studio as optional tooling, so that I can inspect local database state while developing.
17. As a developer, I want database configuration to use Effect Config and redacted secrets, so that database credentials are typed and safe to log.
18. As a developer, I want connection pool settings to be configurable, so that serverless Postgres providers can be tuned safely.
19. As a developer, I want Postgres date/time parsing configured for Drizzle's Effect driver, so that timestamp handling is correct.
20. As a developer, I want database timestamps stored as `timestamptz`, so that persisted time values are unambiguous.
21. As a developer, I want domain logic to continue using Effect Clock millis where appropriate, so that existing time-based tests remain deterministic.
22. As a developer, I want repository adapters to map database rows into domain records, so that database row shapes do not leak into interactors.
23. As a developer, I want domain/application models to remain stable unless business behavior improves, so that persistence does not distort the domain.
24. As an app user, I want my signup to persist durably, so that my account remains available after server restarts.
25. As an app user, I want my password to be securely hashed, so that database access does not reveal my password.
26. As an app user, I want my email verification token to expire, so that old verification links cannot be used indefinitely.
27. As an app user, I want used verification tokens to be rejected, so that links cannot be replayed.
28. As an app user, I want password reset tokens to expire, so that old reset links cannot be used.
29. As an app user, I want used password reset tokens to be rejected, so that a reset link works only once.
30. As an app user, I want my login session to expire, so that abandoned sessions do not remain valid indefinitely.
31. As an app user, I want logout to revoke my session, so that the cookie can no longer authenticate requests.
32. As an app user, I want my session cookie to contain a secure random token, so that it cannot be guessed.
33. As an app user, I want session tokens stored hashed in the database, so that a database leak does not immediately expose active sessions.
34. As an app user, I want auth cookies to be secure and HTTP-only where appropriate, so that browser-side compromise risk is reduced.
35. As a gym owner, I want staff invitation tokens to expire, so that old staff invitations do not remain valid forever.
36. As a gym owner, I want accepted staff invitations to be rejected on reuse, so that one invitation cannot be accepted repeatedly.
37. As an invited staff member, I want invitation email matching to be case-insensitive, so that email capitalization does not block acceptance.
38. As a gym user, I want email uniqueness to be case-insensitive, so that duplicate accounts cannot be created with capitalization changes.
39. As a system admin, I want admin login sessions to expire faster than normal user sessions, so that privileged access has stronger protection.
40. As a system admin, I want the first-admin bootstrap flow to persist durably, so that bootstrap state survives restarts.
41. As a system admin, I want the database schema to allow multiple system admins in the future, so that the app is not locked into a single-admin design.
42. As a developer, I want auth multi-write flows to be transactional, so that partial writes do not leave inconsistent state.
43. As a developer, I want signup writes to be atomic, so that user, credential, and verification token are created together.
44. As a developer, I want password reset completion to be atomic, so that credential update and token consumption cannot diverge.
45. As a developer, I want staff invitation acceptance to be atomic, so that affiliation creation and invitation acceptance cannot diverge.
46. As a developer, I want gym creation approval to be atomic, so that request approval, gym activation, and owner affiliation cannot diverge.
47. As a developer, I want first system admin bootstrap to be atomic, so that admin and credential records cannot diverge.
48. As a developer, I want typed persistence errors, so that database failures are visible in Effect types.
49. As an API client, I want persistence failures to become generic server errors, so that infrastructure failures are not confused with auth business errors.
50. As a developer, I want persistence errors to include operation context, so that logs and traces point to the failing database operation.
51. As a developer, I want database constraints to mirror core auth invariants, so that the database defends application correctness.
52. As a developer, I want module-specific Postgres schemas, so that table ownership is visible in the database.
53. As a developer, I want database foreign keys inside module schemas, so that module-internal integrity is enforced.
54. As a developer, I want to avoid cross-module foreign keys unless ownership is stable, so that module boundaries remain evolvable.
55. As a developer, I want central generated migrations for the merged app schema, so that migration order is managed consistently.
56. As a developer, I want automated tests for expired tokens and sessions, so that auth hardening behavior is protected.
57. As a developer, I want tests to assert behavior rather than exact token strings, so that secure random generation can replace deterministic values.
58. As a developer, I want deterministic test adapters to remain available, so that use-case tests stay predictable.
59. As a developer, I want no new web UX in this milestone, so that the work stays focused on persistence and auth hardening.
60. As a developer, I want existing web auth flows to continue working end to end, so that the persistence migration does not regress current product behavior.

## Implementation Decisions

- Drizzle will be the source of truth for schema definitions and generated SQL migrations.
- Production will not use schema push or automatic runtime migration on application startup.
- Postgres is the target database for local and production environments.
- Local development will use Docker Postgres.
- Production is expected to work with serverless Postgres providers such as Supabase or Neon through configuration changes.
- Generic Drizzle + Effect utilities will live in a packages workspace package named `@workspace/drizzle`.
- `@workspace/drizzle` will expose the shared `DrizzleDatabase` service, Drizzle/Effect Postgres construction helpers, configuration helpers, transaction helpers, and generic `PersistenceError`.
- The product database composition will live in a database module under the modules workspace.
- The database module will assemble module-exported schema contributions and own Drizzle config and generated migrations.
- The database module is a thin composition module, similar to the API module, not a business domain module.
- Auth will define its own database schema contribution in the auth module.
- Auth schema exports will be exposed through a special schema subpath, not the main auth facade.
- Auth repository adapters will live in the auth module and depend on `DrizzleDatabase`.
- Auth will not depend on the database composition module.
- The API app will provide the shared database service built from the merged schema and compose the auth live layer.
- Auth will export one convenient live layer and smaller constituent layers for testability and overrides.
- The auth live layer will include production repository adapters, secure ID/token generation, secure password hashing, token hashing, transaction support, and a non-production email adapter unless a provider is added later.
- Production email delivery is out of scope for this milestone.
- Existing mock/test layers remain available for fast tests and module isolation.
- Use Drizzle's Effect-native Postgres integration with `drizzle-orm/effect-postgres`.
- Use `@effect/sql-pg` as the underlying Postgres client.
- Include Drizzle's recommended Postgres type parser setup for date/time values.
- Use Effect Config for database configuration and redacted secret values.
- Require `DATABASE_URL` for live database configuration.
- Include optional connection pool settings such as max connections and connect timeout.
- Include a non-secret local `.env.example` aligned with Docker Compose.
- Use a Postgres schema per module, starting with an `auth` schema.
- Use database foreign keys within a module schema.
- Avoid cross-module foreign keys unless a relationship is clearly owned by one module and stable.
- Use UUIDs for database entity IDs where practical.
- Keep domain branded string IDs unless changing them improves application clarity.
- Split public bearer session tokens from internal session row IDs.
- Store token/session HMAC digests, not raw bearer tokens, in the database.
- Use HMAC-SHA-256 with a server secret for token/session digests.
- Add required token hash secret configuration for live auth.
- Use Argon2id or bcrypt for password hashing.
- Use cryptographically secure random generation for production IDs and tokens.
- Keep deterministic/sequential adapters for tests.
- Store original email values and normalized email values.
- Use normalized email for uniqueness, lookup, and invitation matching.
- Add a small email identity primitive/helper for normalization.
- Keep broad email validation modest unless application requirements demand more.
- Add fixed expiration for email verification tokens, password reset tokens, staff invitation tokens, gym user sessions, and system admin sessions.
- Use fixed session lifetimes for this milestone, not rolling sessions.
- Suggested lifetimes are 24 hours for email verification, 1 hour for password reset, 7 days for staff invitations, 30 days for gym user sessions, and 12 hours for system admin sessions.
- Expired records are logically invalid but not automatically cleaned up in this milestone.
- Do not add cleanup jobs or archival jobs in this milestone.
- Replace session lifecycle `active` booleans with clearer expiration and revocation fields where appropriate.
- Represent token consumption with timestamp fields where appropriate.
- Keep staff invitation status because it is product-facing, and add expiration and accepted timestamp fields.
- Store timestamps in the database as `timestamptz`.
- Keep domain/application time logic in millis where it fits existing Effect Clock usage.
- Repository adapters map Drizzle rows into domain records through explicit class instantiation.
- Database row shapes do not leak into interactors or module facades.
- Add typed `PersistenceError` to repository port error types.
- Map persistence failures to generic server errors at the HTTP boundary rather than auth-specific API errors.
- Add lightweight observability through named Effect operations and persistence operation context.
- Do not add a health/readiness endpoint in this milestone.
- Do not add optimistic concurrency/version columns in this milestone.
- Use transactions for multi-write auth use cases.
- `@workspace/drizzle` will expose generic transaction support on `DrizzleDatabase`.
- The auth module may expose an auth-facing transaction/unit-of-work port implemented by the database-backed adapter and no-op/test adapters.
- Nested transactions/savepoints are out of scope for this milestone.
- Database constraints should mirror core auth invariants.
- Constraints should include unique normalized emails, unique token/session digests, one credential per account, one affiliation per gym/user, valid status/role values, and module-internal foreign keys.
- The system admin schema should allow multiple system admins even if bootstrap creates only the first admin for now.
- Do not add broad soft deletion or archive states unless the business already has that lifecycle state.
- Keep local bootstrap minimal and rely on existing application flows where possible.
- Include a local-only reset path for development databases.
- Include optional Drizzle Studio tooling for local development.

## Testing Decisions

- Good tests should verify external behavior at the module facade, application boundary, repository adapter boundary, or HTTP/web flow boundary, not private implementation details.
- Existing memory-backed auth tests should remain the fast default behavior suite.
- Tests affected by intentional security/business changes should be updated to assert behavior rather than exact deterministic token/session strings.
- Add or update application-boundary tests for expired email verification tokens.
- Add or update application-boundary tests for expired password reset tokens.
- Add or update application-boundary tests for expired staff invitations.
- Add or update application-boundary tests for expired gym user sessions.
- Add or update application-boundary tests for expired system admin sessions.
- Add tests for token/session reuse rejection where applicable.
- Use Effect `TestClock` for time-dependent auth behavior because current interactors already use Effect Clock.
- Add database-backed adapter/integration tests for auth repository implementations.
- Automated database tests should run behind a separate integration command rather than the default fast `pnpm run test`.
- Docker Compose should support manual local end-to-end testing.
- Testcontainers or an equivalent isolated Postgres fixture is preferred for automated database integration tests if the dependency/runtime setup is acceptable.
- Database integration tests should verify repository contract behavior, transactions for multi-write flows, normalized email lookup, constraints, and token/session hash lookup behavior.
- End-to-end tests should verify existing auth web/API flows against the local database once live wiring is available.
- Prior art includes the existing auth module tests for gym user registration, authentication, password reset, staff invitation, gym request, system admin bootstrap/authentication, and existing API/web auth tests.
- Memory adapters may remain deterministic, but secure production adapters should have focused tests for shape and behavior where practical.

## Out of Scope

- Production email provider selection and integration.
- New web UX or new auth screens.
- Account settings, remember-me controls, session/device management, and admin user management UI.
- Automatic application startup migrations.
- Database health/readiness endpoints.
- Cross-module foreign keys unless a future relationship is clearly owned and stable.
- Cleanup/archive jobs for expired sessions or tokens.
- Broad soft-delete framework for users, admins, gyms, or other entities.
- Rolling session expiration.
- Nested transaction/savepoint semantics.
- Full observability stack, OpenTelemetry exporters, or production logging infrastructure.
- Non-auth module schemas and repository adapters.
- Production seed data beyond minimal bootstrap/local development support.

## Further Notes

This PRD intentionally separates infrastructure from domain ownership. Generic database utilities belong in packages, app-level schema/migration composition belongs in the database module, and auth-specific persistence belongs in the auth module. The database may store richer operational fields than the current domain exposes, but domain/application models should change only when the change improves business behavior, correctness, or use-case clarity.

The first milestone should prioritize getting existing auth flows running end to end against local Postgres while hardening the auth behaviors that persistence makes important: secure password storage, secure token/session handling, expiration, normalized identity, database constraints, typed persistence errors, and transactional consistency.
