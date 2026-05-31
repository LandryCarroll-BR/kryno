## Problem Statement

The frontend app has authentication screens and route actions that are shaped around a typed API client, but local development does not yet have a straightforward way to run the frontend against a separate API server. The API app already composes the HTTP handlers with the Auth test implementation, and the web app already supports a configurable API base URL, but there is no dedicated local API dev server entrypoint.

This makes it harder to exercise the real frontend-to-API boundary during development. The user wants the frontend app to start talking to the API server now, while keeping the API backed by deterministic test implementations until production infrastructure and persistence decisions are ready.

## Solution

Add a local API dev server that serves the existing typed Effect HTTP API through Effect's Node HTTP platform. The API server should run separately from the frontend app, default to `127.0.0.1:4000`, allow `PORT` override, and continue using the Auth test layer for now.

The frontend should continue using its existing API client abstraction and should target the separate API server through the `KRYNO_API_BASE_URL` environment variable. Local development should support running the two apps side-by-side: the API server on port `4000`, and the web app pointed at that API base URL.

## User Stories

1. As a developer, I want to run the API server locally, so that I can exercise API behavior outside of tests.
2. As a developer, I want the API server to use the existing test implementation, so that I can develop frontend flows without waiting for production persistence.
3. As a developer, I want the API server to run separately from the frontend server, so that local development mirrors the intended deployment boundary.
4. As a developer, I want the API server to use Effect's Node HTTP platform, so that serving behavior stays aligned with the Effect HTTP stack.
5. As a developer, I want the API dev server to reuse the existing HTTP API contract and handlers, so that local dev behavior matches tested API behavior.
6. As a developer, I want the API dev server to default to port `4000`, so that the local setup is predictable.
7. As a developer, I want the API dev server to bind to `127.0.0.1`, so that local requests avoid localhost IPv4/IPv6 ambiguity.
8. As a developer, I want to override the API dev server port with `PORT`, so that I can avoid conflicts when port `4000` is unavailable.
9. As a developer, I want a package script for starting the API dev server, so that the command is discoverable and consistent with the monorepo.
10. As a developer, I want the web app to use `KRYNO_API_BASE_URL`, so that I can point it at the local API server without code changes.
11. As a developer, I want signup form submissions to call the API server, so that I can validate the real frontend-to-API integration.
12. As a developer, I want email verification form submissions to call the API server, so that I can complete the development auth flow.
13. As a developer, I want login form submissions to call the API server, so that the frontend receives a real session response from the API.
14. As a developer, I want the web app to store its own session cookie from the API login response, so that the frontend remains responsible for browser session state.
15. As a developer, I want protected frontend loaders to call the API server with bearer authentication, so that server-side route protection exercises the API auth boundary.
16. As a developer, I want logout to call the API server with bearer authentication, so that local logout invalidates the API-side test session.
17. As a developer, I want API cookies not to be relied on by the web app, so that cross-origin local development does not depend on browser cookie forwarding.
18. As a developer, I want typed API errors to keep flowing through the existing frontend action handling, so that expected failures remain user-friendly.
19. As a developer, I want unexpected API failures to surface clearly during local development, so that integration defects are not silently swallowed.
20. As a developer, I want the local API dev server to be small and focused, so that later production server concerns do not leak into this first integration slice.
21. As a developer, I want the API app tests to continue covering the composed API contract, so that adding a dev server does not weaken existing guarantees.
22. As a developer, I want the web API client tests to continue covering request shape and authentication headers, so that frontend integration behavior remains stable.
23. As a developer, I want documentation or package scripts to make the two-server setup obvious, so that future development sessions start quickly.
24. As a developer, I want the API server dependency list to explicitly include the Node platform package, so that the runtime boundary is declared rather than incidental.
25. As a developer, I want this integration to avoid production database, email, and auth-token infrastructure for now, so that the first milestone stays focused.

## Implementation Decisions

- The frontend and API will run as separate local servers.
- The API dev server will use Effect's Node HTTP platform rather than a hand-written Node-to-Web request adapter.
- The API dev server will serve the existing Effect HTTP API routes and handlers.
- The API dev server will continue to compose Auth with the test layer for now.
- The API dev server will default to `127.0.0.1:4000`.
- The API dev server will support `PORT` as an override for the port.
- The web app will continue to use the existing typed API client abstraction.
- The web app will target the API server through `KRYNO_API_BASE_URL`.
- Browser-facing session state remains owned by the web app; the API login response supplies the session id used to set the web cookie.
- Protected API requests from the web app will continue using bearer authorization rather than forwarded cookies.
- The API server package will declare the Effect Node platform dependency directly.
- A package script will be added so the API dev server can be started consistently through the workspace tooling.
- No new API contract is required for this first slice; the existing auth endpoints are enough to validate the connection.
- No module architecture refactor is required for this first slice because the API and Auth modules already expose the necessary facade-level pieces.
- The useful deep module boundary is the existing typed API client in the web app: it encapsulates HTTP transport, base URL configuration, request construction, decoded responses, and bearer authentication behind a small interface.
- The local API dev server should remain a thin runtime entrypoint, not a new application service with business rules.

## Testing Decisions

- Good tests should verify external behavior: command-visible server behavior, HTTP request/response behavior, base URL usage, bearer authentication, and frontend action/loader outcomes. Tests should avoid asserting internal implementation details such as exact layer composition unless that composition is the external behavior under test.
- API app tests should continue covering that the composed API contract serves auth routes, rejects unauthorized requests, and handles bearer-authenticated gym-user session flows.
- Web API client tests should continue covering that `KRYNO_API_BASE_URL` is honored, login returns decoded session data, current-session requests use bearer auth, logout uses bearer auth, and cookies are not forwarded accidentally.
- Route action and loader tests should continue covering signup, verification, login, app loading, and logout behavior through injected clients.
- A focused API dev server test may be added if the server entrypoint can be tested without long-running process management. The test should verify that the served API responds through the same contract and test implementation.
- Prior art exists in the API app integration tests for contract-level HTTP behavior.
- Prior art exists in the web API client tests for request construction, environment configuration, and bearer auth behavior.
- Prior art exists in the web route tests for action and loader behavior with dependency-injected API clients.
- Full browser end-to-end tests are out of scope for the first slice unless the implementation reveals a specific browser-only failure.

## Out of Scope

- Production persistence for Auth.
- Production email delivery.
- Production token generation.
- Production deployment topology.
- Cross-origin browser API calls from client-side components.
- CORS policy design, unless the implementation changes from server-side React Router calls to browser-side fetches.
- Replacing the existing web API client abstraction.
- Rewriting the Auth module or HTTP API contracts.
- Adding new user-facing frontend screens beyond what is needed to validate the existing auth flow.
- Introducing API session cookies as the frontend session mechanism.
- Building a process manager for starting both dev servers together.

## Further Notes

The current API app already uses the Auth test implementation, so the main missing piece is a local runtime entrypoint. The frontend already has the right seam for a separate API server through `KRYNO_API_BASE_URL`. The first implementation should be intentionally small: add the Effect Node HTTP platform dependency, expose a local dev server command, and verify the existing auth screens can communicate with the API server.

After this slice lands, the next useful planning branch is deciding whether to add a convenience root-level development command that starts both servers with the correct environment, or to keep server startup explicit while the API surface is still evolving.
