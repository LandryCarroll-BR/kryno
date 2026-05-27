## Parent PRD

`issues/prd.md`

## What to build

Create the dedicated auth module package and prove the Effect-native module shape with one tiny, testable use case. This slice establishes the package boundary, public exports, domain conventions, typed errors, test setup, and in-memory testing approach described in the PRD.

## Acceptance criteria

- [ ] A dedicated auth package exists in the workspace and can be typechecked.
- [ ] The package exports its public domain, service, policy, and controller-facing entrypoints from a stable module boundary.
- [ ] Effect-native test infrastructure is configured for the auth package.
- [ ] At least one minimal use case is implemented with an Effect service, a test layer, and a passing behavior test.
- [ ] The package uses schema-backed domain modeling and typed recoverable errors for the minimal use case.

## Blocked by

None - can start immediately

## User stories addressed

- User story 1
- User story 2
- User story 33
- User story 34
- User story 35
- User story 39
- User story 42
- User story 43
- User story 44
