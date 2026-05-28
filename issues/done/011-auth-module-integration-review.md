## Parent PRD

`issues/prd.md`

## What to build

Perform a human review of the completed auth module public surface before designing persistence, web delivery, or UI adapters. This should confirm that the module is deep, stable, testable, and aligned with the PRD's scope boundaries.

## Acceptance criteria

- [x] The public auth module interface is reviewed for stability and clarity.
- [x] The completed schema-backed Effect HTTP API contract surface is reviewed for coverage of completed auth use cases.
- [x] The module is confirmed to keep production infrastructure, web app routes, API clients, cookies, UI, social features, training features, and full gym membership management out of scope.
- [x] The team confirms that active gym status is treated as an authorization input, not as an auth-owned suspension/reactivation workflow.
- [x] Follow-up adapter or product-module issues can be drafted from the reviewed interface.
- [x] Any requested public-interface changes are captured before downstream adapter work begins.

## Blocked by

- Blocked by `issues/010-auth-controller-dto-contracts.md`

## User stories addressed

- User story 1
- User story 2
- User story 44
- User story 45
- User story 46
- User story 47
- User story 48

## Review outcome

Completed on 2026-05-28.

The public auth facade is stable enough for downstream adapter work. `Auth` exposes one method per completed use case and keeps callers on input/output schemas and typed domain errors instead of repository or infrastructure details. The root package export remains intentionally small: the facade plus mock/test layers. Lower-level interactor, port, adapter, and HTTP contract subpaths are available for module-local composition and future infrastructure adapters without forcing web delivery concerns into the root API.

The schema-backed Effect HTTP API surface covers the completed auth use cases: admin bootstrap, admin login/current session/logout, gym-side signup/email verification/login/current session/logout, password reset request/completion, gym creation request/approval, member join/leave, and Staff invitation create/accept. Endpoint contracts are grouped under `AuthHttpGroup`, exported through `auth-api`, and handler wiring delegates through the public `Auth` facade.

Scope boundaries were checked against `modules/auth/src`, `modules/auth/test`, and `modules/auth/package.json`. No production persistence, database schema, web app routes, API client, cookie/browser adapter, UI, social product feature, training feature, billing, waiver/check-in, or full gym membership-management implementation is present.

Active gym status is confirmed as an authorization input for existing auth use cases. The auth module models `pending`, `active`, and `suspended` gym states and denies gym-scoped access to inactive gyms, but it does not expose suspend/reactivate workflows. Those workflows should be designed as platform-operations/product-module work before any adapter depends on them.

No immediate public-interface change is requested before downstream adapter work. Good next issues from this reviewed interface are:

- Add production persistence adapters for the existing repository ports.
- Add web delivery/server wiring around `AuthHttpApi` and `AuthHttpHandlersLive`.
- Add browser session/cookie adapter behavior outside the auth core.
- Add platform-operations design for gym suspension/reactivation if that remains in product scope.
