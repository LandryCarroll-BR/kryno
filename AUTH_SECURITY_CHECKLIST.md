# Auth Security Checklist

Work from top to bottom. The first two items should be completed before the
authentication system is used in production.

## Critical

### Replace SHA-256 password hashing with Argon2id

- [ ] Select an actively maintained Argon2id implementation.
- [ ] Store encoded hashes containing the algorithm, parameters, salt, and hash.
- [ ] Replace `UserService.hashPassword` with Argon2id hashing.
- [ ] Replace `UserService.validatePasswords` with the library's verification
      function.
- [ ] Choose and document memory, time, and parallelism parameters appropriate
      for the production environment.
- [ ] Design a migration strategy for existing SHA-256 hashes, such as
      rehashing after a successful login.
- [ ] Ensure passwords and password hashes never appear in logs or errors.
- [ ] Add tests for correct passwords, incorrect passwords, unique salts, and
      malformed stored hashes.

Relevant file:
`modules/auth/infrastructure/src/services/user.service.ts`

### Enforce authentication at every protected server boundary

- [ ] Stop treating the presence of `authToken` as proof of authentication.
- [ ] Add a reusable server-side guard that validates the session and loads the
      current user.
- [ ] Use the guard in every protected page, route handler, server action, and
      data query.
- [ ] Redirect browser page requests with invalid sessions to `/sign-in`.
- [ ] Reject unauthorized server actions and API requests rather than merely
      hiding UI.
- [ ] Delete invalid, expired, or revoked authentication cookies when possible.
- [ ] Keep the proxy cookie check only as an optional early redirect.
- [ ] Add tests showing that forged, malformed, expired, and revoked cookies
      cannot access protected resources.

Relevant files:

- `apps/web/proxy.ts`
- `modules/auth/application/src/factories/validate-session.factory.ts`
- `modules/auth/adapters/next/src/controllers/get-current-user.controller.ts`

## High Priority

### Add sign-in rate limiting

- [ ] Rate-limit attempts by both normalized account identifier and client IP.
- [ ] Add progressive delays or temporary cooldowns after repeated failures.
- [ ] Ensure limits work across application instances by using shared storage.
- [ ] Define behavior when the rate-limit store is unavailable.
- [ ] Record security events without logging passwords or session tokens.
- [ ] Return a generic response that does not reveal whether an account exists.
- [ ] Add tests for limit enforcement, reset windows, and successful login
      behavior.

Relevant file:
`modules/auth/application/src/use-cases/sign-in.use-case.ts`

### Prevent account enumeration

- [ ] Replace distinct “email not found” and “invalid password” responses with
      one generic authentication error.
- [ ] Perform a dummy Argon2id verification when no account exists to reduce
      timing differences.
- [ ] Avoid returning submitted email addresses inside authentication errors.
- [ ] Review sign-up duplicate-account messages and decide whether exposing
      account existence is acceptable for the product.
- [ ] Add tests confirming equivalent public responses for unknown accounts and
      incorrect passwords.

Relevant files:

- `modules/auth/application/src/errors/user.errors.ts`
- `modules/auth/application/src/use-cases/sign-in.use-case.ts`
- `modules/auth/adapters/next/src/presenters/sign-in.presenter.ts`

### Add an absolute session lifetime

- [ ] Define and document inactivity and absolute expiration periods.
- [ ] Reject sessions whose `createdAt` exceeds the absolute lifetime.
- [ ] Keep activity refreshes from extending the absolute expiration time.
- [ ] Align cookie expiration with server-side session expiration.
- [ ] Consider rotating session tokens after login and sensitive account
      changes.
- [ ] Add tests for inactivity expiry, absolute expiry, refresh behavior, and
      token rotation.

Relevant files:

- `modules/auth/application/src/models/session.models.ts`
- `modules/auth/application/src/factories/validate-session.factory.ts`
- `modules/auth/adapters/next/src/controllers/sign-in.controller.ts`
- `modules/auth/adapters/next/src/controllers/sign-up.controller.ts`

### Do not expose credential fields through current-user responses

- [ ] Introduce a public/current-user model that excludes `passwordHash`.
- [ ] Map the persisted `User` entity to that safe model in the use case.
- [ ] Review all module exports to ensure credential-bearing models do not cross
      presentation or API boundaries unnecessarily.
- [ ] Add a test asserting that current-user results contain no password hash or
      other credential material.

Relevant files:

- `modules/auth/application/src/models/user.models.ts`
- `modules/auth/application/src/use-cases/get-current-user.use-case.ts`

## Hardening

### Normalize user identifiers

- [ ] Define canonical email normalization, at minimum trimming and consistent
      casing.
- [ ] Apply normalization before both storage and lookup.
- [ ] Decide whether usernames are case-sensitive and enforce that consistently.
- [ ] Add database support for canonical uniqueness if needed.
- [ ] Add tests covering whitespace and casing variants.

### Harden the authentication cookie

- [ ] Consider using a `__Host-` prefixed cookie name in production.
- [ ] Keep `HttpOnly`, `Secure`, `SameSite`, and `Path=/` explicitly configured.
- [ ] Centralize cookie creation and deletion so their options cannot drift.
- [ ] Verify that cookie lifetime matches the server-side session policy.
- [ ] Confirm the desired CSRF policy for every state-changing server action.

### Review database credentials and privileges

- [ ] Confirm `auth_local` is used only in local development.
- [ ] Keep production credentials outside the repository and rotate them
      through the deployment secret manager.
- [ ] Grant the runtime database role only the privileges required by the auth
      module.
- [ ] Separate migration privileges from runtime privileges.

Relevant file:
`modules/auth/infrastructure/bootstrap.sql`

## Final Verification

- [ ] Add an end-to-end test for sign-up, sign-in, authenticated access, and
      sign-out.
- [ ] Test forged, malformed, expired, revoked, and stolen-session scenarios.
- [ ] Test concurrent sign-ups using the same email or username.
- [ ] Run the auth package tests and type checks.
- [ ] Perform a production-like review with HTTPS and production cookie flags.
- [ ] Document the final password, session, rate-limit, and account-recovery
      policies.
