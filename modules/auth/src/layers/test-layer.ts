import { Layer } from "effect"

import { GymUserRegistrationRepositoryMemoryAdapter } from "../adapters/repositories/gym-user-registration-repository-memory.ts"
import { SystemAdminBootstrapRepositoryMemoryAdapter } from "../adapters/repositories/system-admin-bootstrap-repository-memory.ts"
import { AuthIdGeneratorSequentialAdapter } from "../adapters/services/auth-id-generator-sequential.ts"
import { PasswordHasherDeterministicAdapter } from "../adapters/services/password-hasher-deterministic.ts"
import { GymUserRegistrationInteractor } from "../application/gym-user-registration/gym-user-registration-interactor.ts"
import { SystemAdminBootstrapInteractor } from "../application/system-admin-bootstrap/system-admin-bootstrap-interactor.ts"
import { AuthLive } from "./live-layer.ts"

export const AuthApplicationTestLayer = Layer.merge(
  GymUserRegistrationInteractor,
  SystemAdminBootstrapInteractor
).pipe(
  Layer.provideMerge(GymUserRegistrationRepositoryMemoryAdapter),
  Layer.provideMerge(SystemAdminBootstrapRepositoryMemoryAdapter),
  Layer.provideMerge(AuthIdGeneratorSequentialAdapter),
  Layer.provideMerge(PasswordHasherDeterministicAdapter)
)

export const AuthLiveTestLayer = AuthLive.pipe(
  Layer.provide(AuthApplicationTestLayer)
)

export const AuthTestLayer = AuthApplicationTestLayer
