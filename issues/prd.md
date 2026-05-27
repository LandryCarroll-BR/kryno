## Problem Statement

The platform needs a first authentication module for a rock climbing personal training and social media product. The product will support system-level administrators, climbing gyms, gym owners/staff, and gym members, but it is not intended to be a full gym membership management system.

Right now the codebase is a starter monorepo without an auth domain, persistence layer, HTTP API, or production infrastructure. The team needs a clear product and technical definition for an authentication core that can be implemented first and later connected to real infrastructure.

The authentication module must distinguish platform administration from gym-side usage, support gym creation and approval, allow people to join and leave gyms freely, and keep privileged gym staff access controlled. It should define the behavior and boundaries of authentication without prematurely implementing database, email, web routes, or unrelated business logic.

## Solution

Build a new authentication module as an Effect-native clean architecture core. The module will define domain entities, policies, repository/service ports, application services, controller-level DTO contracts, typed errors, and behavior tests.

The module will use two separate authentication namespaces:

- System administrators authenticate through a dedicated admin identity model, credential model, session model, and policy surface.
- Gym-side users authenticate through a separate user identity model used by owners, staff, and members.

Gym-side users can sign up with email, password, and display name. They must verify their email before accessing authenticated gym-side features. A gym-side user may request creation of a gym. A system administrator approves the gym request, activating the gym and assigning the requester as the gym Owner.

Gym roles are scoped to a gym and use the vocabulary Owner, Staff, and Member. Members can self-join or leave any active gym at any time. Staff access is privileged and must be granted through an Owner invitation. System administrators can approve gyms and suspend/reactivate gyms. Suspended gyms block gym-scoped access for Owners, Staff, and Members.

The first version will not implement concrete persistence, HTTP routes, UI, real email delivery, cookie handling, or social/training business features. Those will be added later as adapters or separate modules.

## User Stories

1. As a platform founder, I want a dedicated auth module, so that user identity and access rules are consistent across the product.
2. As a platform founder, I want auth behavior defined before infrastructure, so that the core domain is not coupled to a database or hosting choice.
3. As a platform founder, I want system administrators separated from gym-side users, so that platform administration has a stronger boundary.
4. As a system administrator, I want to authenticate with a dedicated admin account, so that I can perform platform-level operations.
5. As a system administrator, I want admin sessions to be separate from gym-side sessions, so that admin access cannot accidentally bleed into the gym-side app.
6. As a system administrator, I want to approve new gym requests, so that fake or unwanted gyms do not become active automatically.
7. As a system administrator, I want to suspend a gym, so that I can block access for gyms that should not currently operate on the platform.
8. As a system administrator, I want to reactivate a suspended gym, so that a gym can regain access after a platform-level issue is resolved.
9. As a system administrator, I want only verified and authenticated admin users to perform admin actions, so that platform operations are protected.
10. As a platform operator, I want a bootstrap flow for the first admin, so that the system can be initialized without open admin registration.
11. As a gym-side user, I want to create an account with email, password, and display name, so that I can use the climbing training and social app.
12. As a gym-side user, I want to verify my email address, so that the platform can trust my account before granting access.
13. As a gym-side user, I want unverified access to be blocked from authenticated features, so that account trust rules are simple and consistent.
14. As a gym-side user, I want to log in with email and password, so that I can access my account.
15. As a gym-side user, I want to log out, so that I can end access on a device.
16. As a gym-side user, I want to request a password reset, so that I can recover access if I forget my password.
17. As a gym-side user, I want password reset tokens to expire, so that old recovery links cannot be used indefinitely.
18. As a gym-side user, I want password reset tokens to be single-use, so that a used recovery link cannot be replayed.
19. As a gym-side user, I want the same email to be allowed in the admin namespace and gym-side namespace, so that one person can be both a platform admin and an app user.
20. As a prospective gym owner, I want to request a new gym, so that my gym can participate in the platform.
21. As a prospective gym owner, I want my gym request to remain pending until approval, so that the platform can review new gyms before activation.
22. As an approved gym owner, I want to automatically become the Owner of the gym I requested, so that I can manage privileged gym access.
23. As a gym Owner, I want to invite Staff, so that trusted employees or collaborators can help represent the gym.
24. As a gym Owner, I want Staff access to require invitation, so that users cannot self-assign privileged gym permissions.
25. As gym Staff, I want to accept privileged access to a gym, so that I can act on behalf of that gym where authorized.
26. As gym Staff, I want my permissions to be scoped to a specific gym, so that staff access at one gym does not grant access at another.
27. As a gym member, I want to join any active gym myself, so that I can affiliate with the places where I climb.
28. As a gym member, I want to leave a gym myself, so that I can manage my own gym affiliations.
29. As a gym member, I want joining a gym to be lightweight, so that the app feels social and training-focused rather than like a billing system.
30. As a gym member, I want leaving a gym to preserve enough state for future product history, so that the platform can later support useful social or training context.
31. As a gym-side user, I want a clear current-session contract, so that the app can determine who I am and what gym-scoped roles I hold.
32. As a gym-side user, I want suspended gyms to block access, so that inactive or problematic gyms do not remain usable.
33. As a developer, I want typed domain errors, so that expected failures are explicit and recoverable.
34. As a developer, I want branded IDs and schema-backed models, so that domain data is validated and IDs are not accidentally mixed.
35. As a developer, I want repository ports instead of concrete storage, so that persistence can be implemented later without rewriting auth behavior.
36. As a developer, I want password hashing behind a service port, so that secure credential handling can be implemented by an adapter.
37. As a developer, I want token generation behind a service port, so that verification and reset tokens can be implemented securely later.
38. As a developer, I want email delivery behind a service port, so that verification, reset, and staff invitation flows can be tested without a real provider.
39. As a developer, I want application services to express auth use cases, so that behavior is testable without HTTP or UI.
40. As a developer, I want controller-level DTO contracts, so that later HTTP handlers can validate inputs and call the auth core consistently.
41. As a developer, I want policy modules for authorization decisions, so that access rules are centralized and easy to test.
42. As a developer, I want in-memory test layers, so that auth flows can be tested before real infrastructure exists.
43. As a developer, I want Effect-native tests, so that service dependencies, typed errors, and async flows are tested in the same style as the module.
44. As a future API developer, I want the auth module to expose stable interfaces, so that HTTP routes can be added as thin adapters.
45. As a future frontend developer, I want auth screens to be out of the first core module, so that UI decisions can be made after behavior is stable.
46. As a future infrastructure developer, I want database schema decisions deferred, so that the core can be reviewed before choosing persistence details.
47. As a future product developer, I want social and training profile fields outside auth, so that the auth model stays small and focused.
48. As a future product developer, I want gym membership management out of scope, so that the app can remain focused on training and social affiliation.

## Implementation Decisions

- Build a new dedicated auth package rather than placing auth inside the shared package or web app.
- Use Effect-native architecture for the core module.
- Use service-driven development with Context service contracts and Layers.
- Use schema-backed domain models, branded identifiers, and typed errors.
- Keep domain behavior independent of infrastructure adapters.
- Model system administrators as a separate identity namespace from gym-side users.
- Allow the same email address to exist once in each auth namespace.
- Use email and password as the initial credential method.
- Require gym-side email verification before authenticated app access.
- Use a bootstrap use case for creating the first system administrator.
- Define admin sessions separately from gym-side sessions.
- Plan for database-backed session semantics through repository contracts, while deferring actual persistence.
- Model gym states as pending, active, and suspended.
- Model gym affiliation states as active and left.
- Model gym-scoped roles as Owner, Staff, and Member.
- Treat a Gym Manager signup as a gym creation request that becomes an Owner assignment after system-admin approval.
- Allow members to self-join and self-leave active gyms.
- Require Owner invitation for Staff assignment.
- Include password reset contracts in the first module.
- Include email verification, password reset, and staff invitation token behavior in the module contracts.
- Define controller-level DTO contracts without implementing HTTP routes.
- Define repository ports for users, admins, gyms, affiliations, sessions, credentials, verification tokens, password reset tokens, and staff invitations.
- Define service ports for password hashing, secure token generation, email delivery, clock/time, and ID generation where needed.
- Define application services for signup, verification, login, logout, current session, admin bootstrap, gym requests, gym approval, gym suspension, member join/leave, staff invitation, and password reset.
- Define policies for session validity, verified-user access, admin-only actions, active-gym access, Owner-only Staff invitation, and member self-affiliation.
- Keep display name as the only profile-like field in auth.
- Keep athlete profile, trainer profile, avatar, social graph, feed, messaging, workouts, and training business rules out of this module.

## Testing Decisions

- Add Vitest and Effect-native testing support.
- Tests should validate external behavior and user-observable outcomes rather than implementation details.
- Tests should exercise application services and policies through public module contracts.
- Tests should use fresh in-memory layers per test to avoid state leakage.
- Test layers should implement repository and service ports without real infrastructure.
- The auth module should be tested before adding database, HTTP, or UI adapters.
- Test admin bootstrap idempotency and first-admin creation.
- Test separation between admin identity/session namespace and gym-side identity/session namespace.
- Test that duplicate emails are allowed across namespaces but not within the same namespace.
- Test gym-side signup, email verification, and verified-access gating.
- Test login success, login failure, logout, and invalidated sessions.
- Test password reset request, expiration, single-use behavior, and password update.
- Test gym creation request, pending state, approval, active state, and Owner assignment.
- Test gym suspension and reactivation access effects.
- Test member self-join and self-leave behavior for active gyms.
- Test that members cannot self-join suspended or pending gyms.
- Test Staff invitation by Owner.
- Test that Staff cannot self-assign privileged access.
- Test that non-Owners cannot invite Staff.
- Test policy behavior independently where it is exposed as a stable module interface.
- There is no prior auth test suite in the current codebase; the closest prior art will be the repo's existing TypeScript package boundaries and Effect setup.

## Out of Scope

- Database schema design, migrations, ORM choice, SQL adapters, and production persistence.
- HTTP route implementation, React Router loaders/actions, API clients, and request/response wiring.
- Login, signup, verification, reset, admin, or gym management UI.
- Cookie serialization, browser session adapter, CSRF handling, and deployment-specific security headers.
- Hosted auth providers.
- Full gym membership management, billing, waivers, check-ins, facility access, and payment status.
- Social media features such as profiles beyond display name, posts, follows, comments, direct messages, notifications, and feeds.
- Personal training features such as workouts, programming, coaching plans, exercise libraries, progress tracking, and trainer/client relationships.
- Gym discovery, search, location data, branding, media, or public gym pages.
- Role hierarchies beyond Owner, Staff, and Member.
- Multi-factor authentication and single sign-on.
- Audit logs and compliance reporting.

## Further Notes

- The module should be designed as a deep module: a relatively small public interface should encapsulate a large amount of auth behavior.
- Infrastructure should be added later as adapters that satisfy the auth module's service and repository ports.
- HTTP routes should eventually be thin adapters over controller-level DTO contracts.
- The current repo already includes Effect in the shared module and Effect tooling in the workspace, but the auth module should own its own package boundary.
- Before implementation, consult the local Effect guidance for services, layers, data modeling, error handling, and testing patterns.
