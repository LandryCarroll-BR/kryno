## Parent PRD

`auth-issues/prd.md`

## What to build

Change the web gym-user login flow so Kryno Web creates its own browser session cookie from the session DTO returned by the Core API. The web app should stop relying on Core API `Set-Cookie` headers and should set a host-only, HTTP-only cookie that belongs to the web app origin.

## Acceptance criteria

- [ ] The web API client returns the decoded gym-user login session DTO from the Core API.
- [ ] The login action stores the returned opaque session id in a web-owned cookie.
- [ ] The cookie is host-only, HTTP-only, `SameSite=Lax`, `Path=/`, and secure outside local HTTP development.
- [ ] The Core API login response is not expected to include browser cookie headers.
- [ ] Successful login redirects to `/app` with the web-owned cookie set.
- [ ] Web client and route action tests verify DTO capture, cookie attributes, and the absence of reliance on Core API `Set-Cookie` headers.

## Blocked by

None - can start immediately

## User stories addressed

- User story 1
- User story 2
- User story 11
- User story 16
- User story 18
- User story 19
- User story 23

