## Parent PRD

`issues/prd.md`

## What to build

Create the first-party composed Kryno API contract module and Vercel serverless API app described in the parent PRD. This slice should expose Auth routes through `/api/auth/...`, compose module-provided Auth handlers and layers in the API app, and use the Auth test layer for the initial deployable integration surface.

## Acceptance criteria

- [ ] A modules workspace API contract module exports a composed `KrynoHttpApi` contract that includes the Auth HTTP group without coupling consumers to server runtime code.
- [ ] A separate API app exposes one catch-all Vercel API entrypoint under `/api/*` with no `/v1` prefix.
- [ ] The API app composes Auth handlers from the Auth module and provides the existing Auth test layer for the initial integration.
- [ ] API app tests verify Auth routes are served through `/api/auth/...` using the composed contract and module-provided handlers.
- [ ] Future module groups can be added to the composed API contract without changing the web app to import server runtime internals.

## Blocked by

None - can start immediately

## User stories addressed

- User story 20
- User story 21
- User story 22
- User story 25
- User story 26
- User story 27
- User story 30
