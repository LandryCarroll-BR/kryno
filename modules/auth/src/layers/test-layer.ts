import { Layer } from "effect"

import { GymRepositoryMemoryAdapter } from "../adapters/repositories/gym-repository-memory.ts"
import { GymStaffInvitationRepositoryMemoryAdapter } from "../adapters/repositories/gym-staff-invitation-repository-memory.ts"
import { GymUserRegistrationRepositoryMemoryAdapter } from "../adapters/repositories/gym-user-registration-repository-memory.ts"
import { SystemAdminBootstrapRepositoryMemoryAdapter } from "../adapters/repositories/system-admin-bootstrap-repository-memory.ts"
import { AuthEmailDeliveryMemoryAdapter } from "../adapters/services/auth-email-delivery-memory.ts"
import { AuthIdGeneratorSequentialAdapter } from "../adapters/services/auth-id-generator-sequential.ts"
import { AuthTokenDigesterDeterministicAdapter } from "../adapters/services/auth-token-digester-deterministic.ts"
import { AuthTokenGeneratorSequentialAdapter } from "../adapters/services/auth-token-generator-sequential.ts"
import { PasswordHasherDeterministicAdapter } from "../adapters/services/password-hasher-deterministic.ts"
import { GymRequestInteractor } from "../application/gym-request/gym-request-interactor.ts"
import { GymStaffInvitationInteractor } from "../application/gym-staff-invitation/gym-staff-invitation-interactor.ts"
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
  GymRequestInteractor,
  GymStaffInvitationInteractor,
  SystemAdminBootstrapInteractor,
  SystemAdminAuthenticationInteractor
).pipe(
  Layer.provideMerge(GymUserRegistrationRepositoryMemoryAdapter),
  Layer.provideMerge(GymRepositoryMemoryAdapter),
  Layer.provideMerge(GymStaffInvitationRepositoryMemoryAdapter),
  Layer.provideMerge(SystemAdminBootstrapRepositoryMemoryAdapter),
  Layer.provideMerge(AuthEmailDeliveryMemoryAdapter),
  Layer.provideMerge(AuthIdGeneratorSequentialAdapter),
  Layer.provideMerge(AuthTokenGeneratorSequentialAdapter),
  Layer.provideMerge(AuthTokenDigesterDeterministicAdapter),
  Layer.provideMerge(PasswordHasherDeterministicAdapter)
)

export const AuthTestLayer = Auth.layer.pipe(
  Layer.provide(AuthApplicationTestLayer)
)
