## Problem

Auth HTTP authorization is currently encoded inside one middleware implementation that decides which session authority to use by inspecting endpoint names.

- `AuthSessionTransportRequiredLive` branches on string endpoint names to choose gym-user versus system-admin validation.
- The middleware casts bearer session IDs with `as never`, even though the domain already has branded `GymUserSessionId` and `SystemAdminSessionId` constructors.
- The authorization decision is hidden away from the endpoint list in `auth-group.ts`, so adding a protected system-admin endpoint requires remembering to update a separate string switch.
- This creates integration risk: an endpoint can accidentally receive the wrong session validator while still compiling.

The current shape is otherwise close: endpoint handlers already delegate through the public `Auth` facade, and the authorization layer should keep depending on that facade rather than on interactors, ports, repositories, or adapters.

## Proposed Interface

Introduce explicit gym-user and system-admin HTTP authorization middleware choices behind a tiny authoring interface:

```ts
export class GymUserSessionRequired extends HttpApiMiddleware.Service<
  GymUserSessionRequired,
  { requires: Auth }
>()("@workspace/auth/GymUserSessionRequired", {
  error: HttpApiError.UnauthorizedNoContent,
  security: { bearer: HttpApiSecurity.bearer },
}) {}

export class SystemAdminSessionRequired extends HttpApiMiddleware.Service<
  SystemAdminSessionRequired,
  { requires: Auth }
>()("@workspace/auth/SystemAdminSessionRequired", {
  error: HttpApiError.UnauthorizedNoContent,
  security: { bearer: HttpApiSecurity.bearer },
}) {}

export const AuthHttpAuthorization = {
  gymUser: <Endpoint extends HttpApiEndpoint.AnyWithProps>(endpoint: Endpoint) =>
    endpoint.middleware(GymUserSessionRequired),

  systemAdmin: <Endpoint extends HttpApiEndpoint.AnyWithProps>(
    endpoint: Endpoint
  ) => endpoint.middleware(SystemAdminSessionRequired),

  layer: AuthHttpAuthorizationLive,
} as const
```

Endpoint composition becomes local and reviewable:

```ts
const { gymUser, systemAdmin } = AuthHttpAuthorization

export const AuthHttpGroup = HttpApiGroup.make("auth")
  .add(ReserveGymUserEmailEndpoint)
  .add(SignUpGymUserEndpoint)
  .add(VerifyGymUserEmailEndpoint)
  .add(LoginGymUserEndpoint)
  .add(gymUser(CurrentGymUserSessionEndpoint))
  .add(gymUser(LogoutGymUserEndpoint))
  .add(gymUser(RequestGymCreationEndpoint))
  .add(systemAdmin(ApproveGymCreationRequestEndpoint))
  .add(gymUser(CurrentGymOwnerAccessEndpoint))
  .add(gymUser(JoinGymAsMemberEndpoint))
  .add(gymUser(LeaveGymAsMemberEndpoint))
  .add(gymUser(CreateGymStaffInvitationEndpoint))
  .add(gymUser(AcceptGymStaffInvitationEndpoint))
  .add(BootstrapFirstSystemAdminEndpoint)
  .add(LoginSystemAdminEndpoint)
  .add(systemAdmin(CurrentSystemAdminSessionEndpoint))
  .add(systemAdmin(LogoutSystemAdminEndpoint))
  .prefix("/auth")
```

The middleware layer hides:

- bearer credential extraction and trimming
- empty bearer token rejection
- branded session ID construction with `GymUserSessionId.make` and `SystemAdminSessionId.make`
- delegation to `Auth.currentGymUserSession` or `Auth.currentSystemAdminSession`
- mapping auth/domain failures to `HttpApiError.Unauthorized`
- Effect HTTP middleware plumbing

## Dependency Strategy

**In-process** applies for this refactor.

The HTTP authorization adapter should remain inside the auth API boundary and depend on the stable `Auth` facade:

```txt
auth-group endpoint declarations
  -> auth HTTP authorization middleware
    -> Auth facade
      -> application input boundaries
        -> ports
          -> adapters
```

The middleware should not depend directly on application interactors, repositories, lower-level policies, or persistence adapters. If auth validation later moves behind a remote service, introduce a `PrincipalSessionValidator` port then; for now, a port would add extra shape without changing the runtime boundary.

## Testing Strategy

**New boundary tests to write:**

- Protected gym-user endpoints include `GymUserSessionRequired` middleware.
- Protected system-admin endpoints include `SystemAdminSessionRequired` middleware.
- Public auth endpoints remain unprotected.
- A system-admin-only endpoint rejects a valid gym-user bearer session.
- A gym-user-only endpoint rejects a valid system-admin bearer session.
- Empty or missing bearer credentials still return `401`.
- The middleware implementation contains no `as never` casts and brands raw bearer tokens through the correct domain ID constructors.

**Old tests to delete:**

- Delete or replace tests that only assert a protected endpoint has any middleware. They should assert the intended auth audience where that matters.
- Keep broad route contract tests, but avoid relying on endpoint-name authorization behavior.

**Test environment needs:**

- Existing `AuthTestLayer` is sufficient for boundary behavior.
- Existing `HttpApi.reflect` tests can verify endpoint middleware choices.
- Existing app/API HTTP tests can exercise wrong-principal rejection through real composed handlers.

## Implementation Recommendations

Keep the refactor narrow:

- Rename or replace `AuthSessionTransportRequired` with the two audience-specific middleware services.
- Extract only a small shared helper for bearer token parsing/error mapping if it keeps the middleware implementation clearer.
- Construct branded session IDs explicitly:

```ts
auth.currentGymUserSession({
  sessionId: GymUserSessionId.make(sessionId),
})

auth.currentSystemAdminSession({
  sessionId: SystemAdminSessionId.make(sessionId),
})
```

- Do not introduce request-scoped principal services yet. Handlers can continue to call the `Auth` facade for their business operation.
- Do not introduce an authorization metadata registry yet. The current module only has two principal audiences, and separate middleware services make that distinction clearer than a generic rule system.
- Update `KrynoHttpHandlersLive` to provide the new authorization layer instead of the old `AuthSessionTransportRequiredLive`.
- Prefer the wrapper calls in `auth-group.ts` over raw `.middleware(...)` calls so endpoint authors have one obvious authoring path.
