import { Layer } from "effect"

import { AuthIdGeneratorSequentialAdapter } from "../adapters/auth-id-generator-sequential.ts"
import { GymUserRegistrationRepositoryMemoryAdapter } from "../adapters/gym-user-registration-repository-memory.ts"
import { PasswordHasherDeterministicAdapter } from "../adapters/password-hasher-deterministic.ts"
import { SystemAdminBootstrapRepositoryMemoryAdapter } from "../adapters/system-admin-bootstrap-repository-memory.ts"
import { GymUserRegistrationInteractor } from "../application/gym-user-registration/gym-user-registration-interactor.ts"
import { SystemAdminBootstrapInteractor } from "../application/system-admin-bootstrap/system-admin-bootstrap-interactor.ts"

export const AuthApplicationTestLayer = Layer.merge(
  GymUserRegistrationInteractor,
  SystemAdminBootstrapInteractor
).pipe(
  Layer.provideMerge(GymUserRegistrationRepositoryMemoryAdapter),
  Layer.provideMerge(SystemAdminBootstrapRepositoryMemoryAdapter),
  Layer.provideMerge(AuthIdGeneratorSequentialAdapter),
  Layer.provideMerge(PasswordHasherDeterministicAdapter)
)

export const AuthTestLayer = AuthApplicationTestLayer
