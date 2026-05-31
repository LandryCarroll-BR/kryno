## Problem Statement

Kryno's current Auth HTTP API mixes two different authentication shapes. Some protected endpoints require a bearer credential at the HTTP middleware boundary, while those same endpoints also accept `sessionId` values in route parameters or request payloads. This creates two sources of truth for the authenticated caller, makes it easier for a session credential to leak through URLs and logs, and blurs the line between authentication transport and application input.

The planned deployment shape makes that ambiguity more important to resolve. The web app is expected to run separately from the Core API, with the browser interacting with the web app and the web app calling the Core API. In that model, browser cookies should belong to the web app boundary, while the Core API should expose a clear first-party API contract that authenticates user sessions through bearer credentials. The current mixed cookie, bearer, and client-supplied session-id model does not clearly support that architecture.

The user wants a modern authentication foundation that follows common TypeScript web and API practices, avoids reinventing authentication primitives, and can later grow to support mobile sessions, multi-factor authentication, OAuth or OIDC login, and separate third-party API access credentials without changing the basic session-auth boundary again.

## Solution

Refactor the session transport design so the Core API accepts only bearer session credentials for authenticated session transport. The bearer value represents an opaque Kryno session id for a first-party user session. The Core API validates that bearer credential, derives the authenticated gym-user or system-admin session at the HTTP edge, and passes the trusted session identity into existing Auth application use cases.

Remove client-supplied session identity from protected HTTP contracts. Current-session and logout endpoints should operate on the authenticated caller's session, not on a `sessionId` route parameter. Protected action payloads should describe the action being performed and should not ask the client to tell the server who the caller is.

Move browser session cookie ownership to the web app. On login, the Core API continues returning the session DTO. The web app stores the returned opaque session id in its own host-only HTTP-only cookie. On protected web loaders and actions, the web app reads that cookie server-side and calls the Core API with `Authorization: Bearer <sessionId>`. On logout, the web app sends the bearer credential to the Core API to invalidate the session, then clears its own browser cookie.

This preserves one underlying first-party session model for web and future mobile clients. The browser uses a web-owned HTTP-only cookie because that is the safer browser storage boundary. The web server and future mobile app use bearer transport because that is the standard API transport for non-browser or server-side callers.

## User Stories

1. As a web app user, I want to log in through Kryno Web, so that I can start an authenticated browser session.
2. As a web app user, I want my browser session stored in an HTTP-only cookie, so that client-side JavaScript cannot read my session credential.
3. As a web app user, I want page refreshes to preserve my session, so that I do not need to log in repeatedly.
4. As a web app user, I want to log out reliably, so that my browser no longer has a usable session cookie.
5. As a web app user, I want logout to invalidate the server-side session, so that the same session credential cannot continue being used after logout.
6. As an unauthenticated visitor, I want protected web pages to reject me, so that private app screens are not shown without a valid session.
7. As a gym user, I want the Core API to identify me from trusted authentication transport, so that request bodies do not need to include my session id.
8. As a system admin, I want admin-only Core API routes to require an admin session, so that gym-user sessions cannot access admin behavior.
9. As a gym user, I want gym-user-only Core API routes to require a gym-user session, so that admin or unrelated session types cannot be used accidentally.
10. As a future mobile app user, I want the mobile app to authenticate to the Core API with a bearer session credential, so that mobile does not depend on browser cookies.
11. As a future mobile app user, I want login to continue returning a session DTO, so that the mobile app can store the session id in secure platform storage.
12. As a backend developer, I want authenticated Core API endpoints to derive the caller from `Authorization: Bearer <sessionId>`, so that authentication is handled consistently at the HTTP edge.
13. As a backend developer, I want protected request payloads to exclude `sessionId`, so that application inputs describe business actions rather than caller identity.
14. As a backend developer, I want current-session endpoints to use singular current-session routes, so that the API represents the authenticated caller's current session rather than arbitrary session resources.
15. As a backend developer, I want logout endpoints to operate on the authenticated bearer session, so that clients cannot ask to logout an unrelated session through a route parameter.
16. As a frontend developer, I want the web app to own browser cookie creation and clearing, so that cookie behavior matches the `kryno-web.vercel.app` deployment boundary.
17. As a frontend developer, I want web loaders and actions to translate browser cookies into Core API bearer calls server-side, so that browser JavaScript does not need direct access to the session credential.
18. As a platform developer, I want the Core API to avoid cross-site browser cookie requirements, so that `kryno-api.vercel.app` does not need to support direct browser cookie authentication.
19. As a platform developer, I want the web app cookie to be host-only, so that the session cookie is scoped to the web app origin.
20. As a security-conscious developer, I want session credentials kept out of URLs, so that they are less likely to leak through logs, browser history, analytics, or referrers.
21. As a security-conscious developer, I want there to be one authenticated caller per request, so that conflicting identity signals cannot create ambiguous authorization behavior.
22. As a tester, I want protected API behavior tested through bearer credentials, so that tests match the real Core API authentication contract.
23. As a tester, I want web auth behavior tested through cookie creation, bearer forwarding, and cookie clearing, so that the browser boundary is verified end to end.
24. As a product owner, I want this refactor to avoid introducing third-party API tokens, so that the team can focus on first-party web and mobile session auth.
25. As a future product owner, I want this session model to support MFA later, so that password login can add a challenge step before creating a full session.
26. As a future product owner, I want this session model to support OAuth or OIDC login later, so that external identity providers can create the same internal Kryno session.
27. As a future platform developer, I want third-party API access tokens to be a separate future credential type, so that user sessions are not overloaded with integration or machine-token concerns.
28. As an engineer maintaining the Auth module, I want the Auth domain and application facade to remain session-id based internally for this refactor, so that the HTTP boundary can improve without forcing a broad domain rewrite.
29. As an engineer maintaining the API contract, I want old session-id route and payload shapes removed now, so that the early product does not carry deprecated authentication semantics.
30. As an engineer reviewing auth changes, I want the PRD to document the deployment assumptions, so that future decisions account for the separate web and Core API origins.

## Implementation Decisions

- The Core API will use bearer-only authenticated session transport for this refactor.
- The bearer credential represents an opaque Kryno session id for a first-party gym-user or system-admin session.
- Browser cookies will not be a Core API authentication transport in this refactor.
- The web app will own browser session cookies because the browser-facing deployment boundary is the web app.
- The web app will store the opaque session id directly in its browser cookie.
- The web app session cookie will be host-only, HTTP-only, `SameSite=Lax`, `Path=/`, and secure outside local HTTP development.
- Core API login endpoints will continue returning the existing session DTO.
- The Core API will not set browser session cookies on login.
- The Core API will not clear browser session cookies on logout.
- Web login actions will set the web-owned browser session cookie from the session DTO returned by the Core API.
- Web protected loaders and actions will read the web-owned cookie server-side and call the Core API with `Authorization: Bearer <sessionId>`.
- Web logout actions will call the Core API with bearer authentication, then clear the web-owned browser session cookie.
- Current-session endpoints will use singular authenticated session routes for the current caller.
- Gym-user current session will be exposed as the authenticated gym user's current session, not as a route that fetches an arbitrary session id.
- System-admin current session will be exposed as the authenticated system admin's current session, not as a route that fetches an arbitrary session id.
- Gym-user logout will invalidate the authenticated bearer session.
- System-admin logout will invalidate the authenticated bearer session.
- Protected HTTP request payloads will remove client-supplied `sessionId` fields.
- Protected HTTP handlers will inject the trusted session id derived by middleware before calling existing Auth use cases.
- The Auth domain and application facade will remain session-id based internally for this refactor.
- Gym-user and system-admin bearer authentication will remain separate audiences.
- A gym-user bearer credential must not authenticate system-admin routes.
- A system-admin bearer credential must not authenticate gym-user routes.
- Requests without a bearer credential to protected Core API routes will fail as unauthorized before protected behavior runs.
- Requests with invalid bearer credentials will fail as unauthorized.
- Old HTTP shapes that accept `sessionId` route parameters or protected payload `sessionId` values will be removed rather than kept as deprecated compatibility aliases.
- This refactor will not introduce third-party API keys, OAuth client credentials, machine tokens, or scoped integration tokens.
- Future third-party API access should be represented as a separate credential model with its own scopes, expiration, rotation, hashing, and audit behavior.
- Future MFA should fit before full session creation by introducing pending authentication or challenge state, then creating the same internal session after challenge success.
- Future OAuth or OIDC login should resolve an external identity, link or create a Kryno user, then create the same internal Kryno session used by password login.
- Future mobile auth should use the same login response session DTO and send the session id as bearer authentication to the Core API.

## Testing Decisions

- Tests should verify external behavior and contracts rather than middleware implementation details or private helper functions.
- Auth HTTP API contract tests should verify that current-session and logout routes use singular authenticated session routes.
- Auth HTTP API contract tests should verify that old `:sessionId` current-session and logout routes are no longer present.
- Auth HTTP API contract tests should verify that protected payload schemas no longer require client-supplied session identity.
- Auth HTTP behavior tests should verify that missing bearer credentials are rejected before protected behavior runs.
- Auth HTTP behavior tests should verify that valid gym-user bearer credentials authenticate gym-user protected routes.
- Auth HTTP behavior tests should verify that valid system-admin bearer credentials authenticate system-admin protected routes.
- Auth HTTP behavior tests should verify that wrong-audience bearer credentials are rejected.
- Auth HTTP behavior tests should verify that logout invalidates the authenticated bearer session.
- Auth HTTP behavior tests should verify that current-session responses are resolved from bearer transport.
- Composed API app tests should verify protected Auth routes through the composed Core API surface using bearer headers rather than body session ids.
- Web API client tests should verify that login captures the returned session DTO rather than relying on Core API `Set-Cookie` headers.
- Web route action tests should verify that login sets the web-owned HTTP-only session cookie.
- Web protected loader tests should verify that the web-owned cookie is forwarded to the Core API as bearer authentication.
- Web logout tests should verify that logout forwards bearer authentication to the Core API and clears the web-owned cookie.
- Prior test patterns include existing Auth module service tests, Auth HTTP API contract reflection tests, composed API app route tests, and web route/client tests around login and cookie forwarding.

## Out of Scope

- Production database-backed Auth repositories.
- Production-grade password hashing.
- Production-grade session id or token generation.
- Hashing session ids at rest.
- Session expiration, rotation, device metadata, and session-management UI.
- Multi-factor authentication implementation.
- OAuth or OIDC provider integration.
- Third-party API keys, service accounts, machine tokens, or scoped integration credentials.
- Direct browser-to-Core-API cross-site authentication.
- Cross-site Core API cookies.
- CORS policy design for browser calls directly to the Core API.
- CSRF hardening beyond the web app's host-only same-site cookie baseline.
- Native mobile secure-storage implementation.
- Production observability, audit logging, anomaly detection, or rate limiting.
- API versioning.
- Backward-compatible support for the old session-id route or protected payload shapes.

## Further Notes

This refactor follows the modern separation between authentication transport and application input. Session credentials should not be sent in URLs or ordinary action payloads when the request can authenticate through a standard transport mechanism. For this architecture, bearer authentication is the clean Core API transport, while HTTP-only cookies are the clean browser boundary owned by the web app.

The bearer token in this refactor is not a separate API access credential. It is the transport form of the user's first-party session credential. A future third-party API access feature should use a separate model rather than reusing user sessions.

The web app and Core API are expected to deploy separately, such as `kryno-web.vercel.app` and `kryno-api.vercel.app`. Because the browser-facing app is the web app, the browser cookie should be scoped to the web app origin. The web server can safely translate that cookie into bearer authentication when it calls the Core API server-side.

This design scales to mobile because mobile clients can store the same opaque session id in platform-secure storage and send it as bearer authentication. It scales to MFA because the login flow can create a pending challenge before issuing a full session. It scales to OAuth or OIDC because external identity login can create the same internal Kryno session after provider verification.

This PRD supersedes earlier session transport notes that assumed the Core API would support browser cookies directly. The newer deployment-aware decision is that browser cookies belong only to the web app boundary, while the Core API remains bearer-only for authenticated first-party session transport.
