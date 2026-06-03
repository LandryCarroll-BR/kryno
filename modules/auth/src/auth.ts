import { Effect, Layer } from "effect"
import * as Context from "effect/Context"
import type { PersistenceError } from "@workspace/drizzle"

import { GymUserAuthentication } from "./application/gym-user-authentication/gym-user-authentication-input-boundary.ts"
import { GymUserPasswordReset } from "./application/gym-user-password-reset/gym-user-password-reset-input-boundary.ts"
import { GymUserRegistration } from "./application/gym-user-registration/gym-user-registration-input-boundary.ts"
import { GymRequest } from "./application/gym-request/gym-request-input-boundary.ts"
import { GymStaffInvitation } from "./application/gym-staff-invitation/gym-staff-invitation-input-boundary.ts"
import { SystemAdminAuthentication } from "./application/system-admin-authentication/system-admin-authentication-input-boundary.ts"
import { SystemAdminBootstrap } from "./application/system-admin-bootstrap/system-admin-bootstrap-input-boundary.ts"
import {
  type FirstSystemAdminAlreadyExists,
  type GymAccessInactive,
  type GymCreationRequestInvalid,
  type GymOwnerAccessDenied,
  type GymStaffInvitationInvalid,
  type GymStaffSelfAssignmentDenied,
  type GymUserEmailAlreadyReserved,
  type GymUserEmailVerificationInvalid,
  type GymUserInvalidCredentials,
  type GymMemberAffiliationInvalid,
  type GymUserNotFound,
  type GymUserPasswordResetTokenAlreadyUsed,
  type GymUserPasswordResetTokenExpired,
  type GymUserPasswordResetTokenInvalid,
  type GymUserPasswordResetUnknownEmail,
  type GymUserSessionInvalid,
  type GymUserUnverified,
  type SystemAdminInvalidCredentials,
  type SystemAdminSessionInvalid,
} from "./domain/errors.ts"
import {
  type AcceptGymStaffInvitationInput,
  type ApproveGymCreationRequestInput,
  type CreateGymStaffInvitationInput,
  type CurrentGymOwnerAccessInput,
  type CurrentGymOwnerAccessSuccess,
  type GymCreationRequestApproved,
  type GymCreationRequested,
  type GymMemberJoined,
  type GymMemberLeft,
  type GymStaffInvitationAccepted,
  type GymStaffInvitationCreated,
  type JoinGymAsMemberInput,
  type LeaveGymAsMemberInput,
  type RequestGymCreationInput,
} from "./domain/gym.ts"
import {
  type CurrentGymUserSessionInput,
  type CurrentGymUserSessionSuccess,
  type CompleteGymUserPasswordResetInput,
  type GymUserLoginSuccess,
  type GymUserPasswordResetCompleted,
  type GymUserPasswordResetRequested,
  type GymUserSignupSuccess,
  type GymUserEmailVerificationSuccess,
  type GymUserRegistrationRecord,
  type LoginGymUserInput,
  type LogoutGymUserInput,
  type RequestGymUserPasswordResetInput,
  type ReserveGymUserEmailInput,
  type SignUpGymUserInput,
  type VerifyGymUserEmailInput,
} from "./domain/gym-user.ts"
import {
  type BootstrapFirstSystemAdminInput,
  type BootstrapFirstSystemAdminSuccess,
  type CurrentSystemAdminSessionInput,
  type CurrentSystemAdminSessionSuccess,
  type LoginSystemAdminInput,
  type LogoutSystemAdminInput,
  type SystemAdminLoginSuccess,
} from "./domain/system-admin.ts"

export class Auth extends Context.Service<
  Auth,
  {
    readonly signUpGymUser: (
      input: SignUpGymUserInput
    ) => Effect.Effect<
      GymUserSignupSuccess,
      GymUserEmailAlreadyReserved | PersistenceError
    >
    readonly verifyGymUserEmail: (
      input: VerifyGymUserEmailInput
    ) => Effect.Effect<
      GymUserEmailVerificationSuccess,
      GymUserEmailVerificationInvalid | GymUserNotFound | PersistenceError
    >
    readonly reserveGymUserEmail: (
      input: ReserveGymUserEmailInput
    ) => Effect.Effect<
      GymUserRegistrationRecord,
      GymUserEmailAlreadyReserved | PersistenceError
    >
    readonly loginGymUser: (
      input: LoginGymUserInput
    ) => Effect.Effect<
      GymUserLoginSuccess,
      GymUserInvalidCredentials | GymUserUnverified | PersistenceError
    >
    readonly currentGymUserSession: (
      input: CurrentGymUserSessionInput
    ) => Effect.Effect<
      CurrentGymUserSessionSuccess,
      GymUserSessionInvalid | GymUserUnverified | PersistenceError
    >
    readonly logoutGymUser: (
      input: LogoutGymUserInput
    ) => Effect.Effect<void, GymUserSessionInvalid | PersistenceError>
    readonly requestGymUserPasswordReset: (
      input: RequestGymUserPasswordResetInput
    ) => Effect.Effect<
      GymUserPasswordResetRequested,
      GymUserPasswordResetUnknownEmail | PersistenceError
    >
    readonly completeGymUserPasswordReset: (
      input: CompleteGymUserPasswordResetInput
    ) => Effect.Effect<
      GymUserPasswordResetCompleted,
      | GymUserPasswordResetTokenInvalid
      | GymUserPasswordResetTokenExpired
      | GymUserPasswordResetTokenAlreadyUsed
      | GymUserNotFound
      | PersistenceError
    >
    readonly requestGymCreation: (
      input: RequestGymCreationInput
    ) => Effect.Effect<
      GymCreationRequested,
      GymUserSessionInvalid | GymUserUnverified | PersistenceError
    >
    readonly approveGymCreationRequest: (
      input: ApproveGymCreationRequestInput
    ) => Effect.Effect<
      GymCreationRequestApproved,
      SystemAdminSessionInvalid | GymCreationRequestInvalid | PersistenceError
    >
    readonly currentGymOwnerAccess: (
      input: CurrentGymOwnerAccessInput
    ) => Effect.Effect<
      CurrentGymOwnerAccessSuccess,
      | GymUserSessionInvalid
      | GymUserUnverified
      | GymAccessInactive
      | GymOwnerAccessDenied
      | PersistenceError
    >
    readonly joinGymAsMember: (
      input: JoinGymAsMemberInput
    ) => Effect.Effect<
      GymMemberJoined,
      | GymUserSessionInvalid
      | GymUserUnverified
      | GymAccessInactive
      | GymMemberAffiliationInvalid
      | PersistenceError
    >
    readonly leaveGymAsMember: (
      input: LeaveGymAsMemberInput
    ) => Effect.Effect<
      GymMemberLeft,
      | GymUserSessionInvalid
      | GymUserUnverified
      | GymAccessInactive
      | GymMemberAffiliationInvalid
      | PersistenceError
    >
    readonly createGymStaffInvitation: (
      input: CreateGymStaffInvitationInput
    ) => Effect.Effect<
      GymStaffInvitationCreated,
      | GymUserSessionInvalid
      | GymUserUnverified
      | GymAccessInactive
      | GymOwnerAccessDenied
      | GymStaffSelfAssignmentDenied
      | PersistenceError
    >
    readonly acceptGymStaffInvitation: (
      input: AcceptGymStaffInvitationInput
    ) => Effect.Effect<
      GymStaffInvitationAccepted,
      | GymUserSessionInvalid
      | GymUserUnverified
      | GymAccessInactive
      | GymStaffInvitationInvalid
      | GymStaffSelfAssignmentDenied
      | PersistenceError
    >
    readonly bootstrapFirstSystemAdmin: (
      input: BootstrapFirstSystemAdminInput
    ) => Effect.Effect<
      BootstrapFirstSystemAdminSuccess,
      FirstSystemAdminAlreadyExists | PersistenceError
    >
    readonly loginSystemAdmin: (
      input: LoginSystemAdminInput
    ) => Effect.Effect<
      SystemAdminLoginSuccess,
      SystemAdminInvalidCredentials | PersistenceError
    >
    readonly currentSystemAdminSession: (
      input: CurrentSystemAdminSessionInput
    ) => Effect.Effect<
      CurrentSystemAdminSessionSuccess,
      SystemAdminSessionInvalid | PersistenceError
    >
    readonly logoutSystemAdmin: (
      input: LogoutSystemAdminInput
    ) => Effect.Effect<void, SystemAdminSessionInvalid | PersistenceError>
  }
>()("@kryno/auth/Auth") {
  static readonly layer = Layer.effect(
    Auth,
    Effect.gen(function* () {
      const gymUserAuthentication = yield* GymUserAuthentication
      const gymUserPasswordReset = yield* GymUserPasswordReset
      const gymUserRegistration = yield* GymUserRegistration
      const gymRequest = yield* GymRequest
      const gymStaffInvitation = yield* GymStaffInvitation
      const systemAdminAuthentication = yield* SystemAdminAuthentication
      const systemAdminBootstrap = yield* SystemAdminBootstrap

      return {
        signUpGymUser: gymUserRegistration.signUp,
        verifyGymUserEmail: gymUserRegistration.verifyEmail,
        reserveGymUserEmail: gymUserRegistration.reserveEmail,
        loginGymUser: gymUserAuthentication.login,
        currentGymUserSession: gymUserAuthentication.currentSession,
        logoutGymUser: gymUserAuthentication.logout,
        requestGymUserPasswordReset: gymUserPasswordReset.request,
        completeGymUserPasswordReset: gymUserPasswordReset.complete,
        requestGymCreation: gymRequest.requestCreation,
        approveGymCreationRequest: gymRequest.approveCreationRequest,
        currentGymOwnerAccess: gymRequest.currentOwnerAccess,
        joinGymAsMember: gymRequest.joinAsMember,
        leaveGymAsMember: gymRequest.leaveAsMember,
        createGymStaffInvitation: gymStaffInvitation.create,
        acceptGymStaffInvitation: gymStaffInvitation.accept,
        bootstrapFirstSystemAdmin: systemAdminBootstrap.bootstrapFirstAdmin,
        loginSystemAdmin: systemAdminAuthentication.login,
        currentSystemAdminSession: systemAdminAuthentication.currentSession,
        logoutSystemAdmin: systemAdminAuthentication.logout,
      }
    })
  )
}
