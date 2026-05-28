import { Layer } from "effect"

import { GymUserRegistrationRepositoryMemoryAdapter } from "../adapters/repositories/gym-user-registration-repository-memory.ts"
import { SystemAdminBootstrapRepositoryMemoryAdapter } from "../adapters/repositories/system-admin-bootstrap-repository-memory.ts"
import { AuthEmailDeliveryMemoryAdapter } from "../adapters/services/auth-email-delivery-memory.ts"
import { AuthIdGeneratorSequentialAdapter } from "../adapters/services/auth-id-generator-sequential.ts"
import { AuthTokenGeneratorSequentialAdapter } from "../adapters/services/auth-token-generator-sequential.ts"
import { PasswordHasherDeterministicAdapter } from "../adapters/services/password-hasher-deterministic.ts"
import { GymUserAuthenticationInteractor } from "../application/gym-user-authentication/gym-user-authentication-interactor.ts"
import { GymUserPasswordResetInteractor } from "../application/gym-user-password-reset/gym-user-password-reset-interactor.ts"
import { GymUserRegistrationInteractor } from "../application/gym-user-registration/gym-user-registration-interactor.ts"
import { SystemAdminAuthenticationInteractor } from "../application/system-admin-authentication/system-admin-authentication-interactor.ts"
import { SystemAdminBootstrapInteractor } from "../application/system-admin-bootstrap/system-admin-bootstrap-interactor.ts"
import { Auth } from "../auth.ts"

export const AuthApplicationTestLayer = Layer.mergeAll(
  GymUserRegistrationInteractor,
  GymUserAuthenticationInteractor,
  GymUserPasswordResetInteractor,
  SystemAdminBootstrapInteractor,
  SystemAdminAuthenticationInteractor
).pipe(
  Layer.provideMerge(GymUserRegistrationRepositoryMemoryAdapter),
  Layer.provideMerge(SystemAdminBootstrapRepositoryMemoryAdapter),
  Layer.provideMerge(AuthEmailDeliveryMemoryAdapter),
  Layer.provideMerge(AuthIdGeneratorSequentialAdapter),
  Layer.provideMerge(AuthTokenGeneratorSequentialAdapter),
  Layer.provideMerge(PasswordHasherDeterministicAdapter)
)

export const AuthTestLayer = Auth.layer.pipe(
  Layer.provide(AuthApplicationTestLayer)
)
