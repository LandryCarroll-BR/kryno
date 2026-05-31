## Parent PRD

`issues/prd.md`

## What to build

Add the first end-to-end local API development slice from the PRD: a separately running API server that serves the existing typed Effect HTTP API through Effect's Node HTTP platform, uses the existing Auth test implementation, and can be started through workspace tooling.

## Acceptance criteria

- [ ] The API package declares the Effect Node platform dependency needed to serve HTTP in Node.
- [ ] The API package exposes a local development command that starts the API server.
- [ ] The local API server serves the existing API contract and handlers with the Auth test implementation.
- [ ] The local API server defaults to `127.0.0.1:4000`.
- [ ] The local API server supports overriding the port with `PORT`.
- [ ] A contract-level request against the running local server can exercise at least one existing Auth endpoint.
- [ ] Existing API app tests continue to pass.

## Blocked by

None - can start immediately

## User stories addressed

- User story 1
- User story 2
- User story 3
- User story 4
- User story 5
- User story 6
- User story 7
- User story 8
- User story 9
- User story 20
- User story 21
- User story 24
- User story 25
