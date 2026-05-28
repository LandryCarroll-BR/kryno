## Problem Statement

Kryno has an initial Auth module with typed Effect HTTP API contracts, but the product does not yet have a frontend auth experience or a deployable API surface for the React app to use. The frontend app is currently a starter React Router screen, and there is no composed first-party API module or Vercel serverless API app that can host the Auth endpoints alongside future module endpoints.

The user needs a first gym-user authentication vertical slice that proves the Auth module can be consumed by the web app through a typed API boundary. This slice must establish durable architectural patterns for future modules, serverless hosting, session handling, and React Router data fetching without prematurely building production infrastructure such as persistent repositories, real email delivery, or mobile-specific flows.

## Solution

Build a first gym-user auth vertical slice that includes a shared composed API contract, a Vercel serverless API shell, a typed request-scoped API client for the React Router app, and the initial gym-user auth UI.

The API will be exposed under `/api` from a separate API app and hosted on Vercel serverless functions. A new first-party API module will compose module-owned Effect HTTP API groups into one `KrynoHttpApi` contract. The API app will use that contract, compose Auth handlers, and use the existing Auth test layer for the first integration pass.

The web app will use React Router loaders and actions as the primary data-fetching and mutation boundary. It will create one Kryno API client module, request-scoped for loaders/actions, that uses the composed Effect HTTP API contract. Gym-user auth will use server-set HTTP-only session cookies for the browser, while the HTTP auth edge will also support `Authorization: Bearer <sessionId>` for future non-browser clients. Login will continue to return the session DTO while also setting a session cookie.

The first frontend flow will support gym-user signup, manual email verification token entry, login, current-session loading, logout, and a protected `/app` dashboard shell.

## User Stories

1. As a gym user, I want to create an account with my email, password, and display name, so that I can start using Kryno.
2. As a gym user, I want to see clear validation feedback when signup fails, so that I know how to correct my input.
3. As a gym user, I want duplicate or reserved email errors to be shown in the signup form, so that I understand why signup did not complete.
4. As a gym user, I want to be sent to email verification after signup, so that I can complete the required account activation step.
5. As a gym user in the initial development environment, I want to manually enter an email verification token, so that the flow can be tested before real email delivery exists.
6. As a gym user, I want clear feedback when an email verification token is invalid, so that I can retry with the correct token.
7. As a gym user, I want to log in with my email and password after verification, so that I can access authenticated areas.
8. As a gym user, I want invalid login credentials to be shown as an inline form error, so that I can recover without losing context.
9. As an unverified gym user, I want login attempts to explain that verification is required, so that I know what step remains.
10. As a logged-in gym user, I want my session to persist across page refreshes, so that I do not have to log in repeatedly.
11. As a logged-in gym user, I want to land on a protected `/app` dashboard after login, so that I can tell authentication succeeded.
12. As a logged-in gym user, I want the app shell to load my current session on the server, so that protected UI is based on trusted session state.
13. As an unauthenticated visitor, I want protected pages to redirect me to login, so that I do not see authenticated screens without a session.
14. As a logged-in gym user, I want to log out, so that my session is no longer usable in the browser.
15. As a logged-out gym user, I want refreshes and direct visits to protected pages to continue treating me as logged out, so that logout is reliable.
16. As a frontend developer, I want one typed Kryno API client module in the web app, so that route loaders and actions do not create ad hoc clients.
17. As a frontend developer, I want React Router actions to forward API session cookies, so that HTTP-only session cookies work with server-side route actions.
18. As a frontend developer, I want auth form failures to be represented as action data, so that normal auth failures do not crash route error boundaries.
19. As a frontend developer, I want the auth UI to use shadcn/ui primitives consistently, so that the first auth screens fit the existing design system.
20. As a backend developer, I want a composed first-party API contract module, so that future modules can add endpoint groups without coupling the web app to server runtime code.
21. As a backend developer, I want the API app to compose module-provided handlers and layers, so that app-level hosting does not recreate module internals.
22. As a backend developer, I want Auth test layers reused for the initial serverless integration, so that the frontend can be developed before production adapters exist.
23. As a backend developer, I want the Auth HTTP edge to support HTTP-only cookies for web and bearer session IDs for future clients, so that session transport remains an edge concern.
24. As a future mobile developer, I want login to continue returning a session DTO, so that a mobile client can later authenticate without browser cookies.
25. As a platform developer, I want the API to be hosted under `/api`, so that the frontend and backend can share an origin on Vercel.
26. As a platform developer, I want one catch-all Vercel API entrypoint, so that Auth and future module endpoints can share one serverless API surface.
27. As a platform developer, I want no `/v1` prefix yet, so that the initial API stays simple while preserving the option to add versioning later.
28. As a tester, I want API contract tests for session cookies and bearer headers, so that the transport behavior is verified at the HTTP boundary.
29. As a tester, I want route-level tests or typechecks for redirects and cookie forwarding, so that auth behavior is verified through user-visible outcomes.
30. As a product owner, I want the first slice to be gym-user focused, so that the primary user authentication path is established before admin or staff UI work.

## Implementation Decisions

- Create a first-party API contract module under the modules workspace. It will compose module-owned Effect HTTP API groups and export only contracts, schemas, and API definitions.
- Do not place the composed API contract in the packages workspace because packages are reserved for external infrastructure, UI libraries, tooling, and similar shared infrastructure.
- Do not name the module `core`; use an API-specific module name to avoid creating a vague catch-all module.
- Create a separate API app for Vercel serverless hosting.
- Serve all API endpoints through one catch-all `/api/*` entrypoint.
- Keep the public API base path as `/api`; do not add `/v1` in this slice.
- Keep runtime handler and layer composition in the API app, not the contract module.
- Compose the Auth HTTP handlers from the Auth module instead of recreating Auth internals inside the API app.
- Use the Auth test layer for the first API integration. This is explicitly an integration/demo layer, not production auth infrastructure.
- Update the Auth HTTP contract so gym-user current-session and logout can resolve the session from transport instead of requiring a session ID path parameter for web usage.
- Support both audience-specific HTTP-only cookies and `Authorization: Bearer <sessionId>` at the Auth HTTP edge.
- Use separate session cookies for gym users and system admins to avoid role/session collisions.
- Login responses continue returning the session DTO while also setting the appropriate session cookie for browser clients.
- Logout invalidates the session through the Auth facade and clears the corresponding browser cookie.
- Keep session transport out of the Auth domain model; the Auth facade continues to operate on session IDs.
- Build one API client module in the React app. It is request-scoped for loaders/actions rather than a global singleton.
- React Router loaders and actions are the primary frontend data-fetching and mutation boundary.
- Auth mutations that can set or clear cookies must capture the API response and forward `Set-Cookie` headers from the route action response.
- Local development uses an API base URL environment variable. Production defaults to same-origin `/api`.
- Build the first UI slice for gym users only.
- Use nested auth routes for public auth screens.
- Use `/app` as the first protected authenticated route.
- Use React Router forms/actions with shadcn/ui inputs, buttons, and alerts.
- Show expected auth failures inline in forms. Reserve route error boundaries for unexpected failures.
- Handle email verification through manual token entry while test email delivery is in use.

## Testing Decisions

- Tests should verify external behavior and contracts, not implementation details such as private helper functions or internal layer construction.
- Auth HTTP API tests should verify login success still returns the expected DTO, sets the correct cookie, current-session accepts cookie and bearer session transport, missing sessions fail as unauthorized domain errors, and logout clears the cookie.
- API app tests should verify the composed API serves Auth routes through `/api/auth/...` using the module-provided handlers and Auth test layer.
- Web app tests or typechecks should verify route actions call the single Kryno API client module, forward cookies correctly, return inline action errors for expected auth failures, and redirect unauthenticated users away from `/app`.
- The existing Auth module tests are prior art for Effect service behavior, domain error assertions, and HTTP API contract reflection.
- The existing Auth HTTP API tests are prior art for verifying endpoint names, methods, paths, statuses, and handler delegation.
- Manual acceptance testing should cover signup, manual verification token entry, login, protected app load, refresh persistence, logout, and redirect after logout.

## Out of Scope

- Production database-backed Auth repositories.
- Real password hashing suitable for production.
- Real token generation suitable for production.
- Real email delivery and email-link verification.
- CSRF hardening beyond the initial same-site cookie baseline.
- Full system-admin frontend flows.
- Staff invitation UI.
- Gym creation, gym membership, and owner/staff dashboards.
- Mobile app implementation.
- API versioning with `/v1`.
- Replacing the Auth test layer with production runtime layers.
- Polished final visual design beyond a functional, consistent shadcn/ui auth experience.

## Further Notes

- HTTP-only cookies are the preferred browser session transport for this web app because browser JavaScript cannot read them, reducing token exposure if client-side code is compromised.
- Supporting bearer session IDs at the HTTP edge keeps the door open for future mobile clients without changing the Auth domain.
- Same-origin Vercel deployment is assumed so that `/api` and the React app share cookie behavior naturally.
- The first API layer intentionally uses in-memory/test Auth infrastructure. This makes the slice useful for frontend integration but not production-ready.
- Future API versioning should be handled through Effect HTTP API composition and path prefixes when a breaking API change is actually needed.
