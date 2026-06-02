import { Effect, Layer } from "effect"
import { Auth } from "../auth.ts"
import {
  CurrentGymOwnerAccessSuccess,
  GymAffiliationRecord,
  GymCreationRequestApproved,
  GymCreationRequested,
  GymCreationRequestId,
  GymMemberJoined,
  GymMemberLeft,
  GymStaffInvitationAccepted,
  GymStaffInvitationCreated,
  GymStaffInvitationId,
  GymStaffInvitationRecord,
  GymCreationRequestRecord,
  GymId,
  GymRecord,
} from "../domain/gym.ts"
import {
  CurrentGymUserSessionSuccess,
  GymUserPasswordResetCompleted,
  GymUserPasswordResetRequested,
  GymUserEmailVerificationSuccess,
  GymUserId,
  GymUserLoginSuccess,
  GymUserRegistrationRecord,
  GymUserSessionId,
  GymUserSessionRecord,
  GymUserSignupSuccess,
} from "../domain/gym-user.ts"
import {
  CurrentSystemAdminSessionSuccess,
  FirstSystemAdminCreated,
  SystemAdminLoginSuccess,
  SystemAdminCredentialRecord,
  SystemAdminId,
  SystemAdminRecord,
  SystemAdminSessionId,
  SystemAdminSessionRecord,
} from "../domain/system-admin.ts"

const mockSystemAdmin = new SystemAdminRecord({
  id: SystemAdminId.make("system-admin-mock"),
  email: "mock-admin@example.com",
})

const mockSystemAdminSession = new SystemAdminSessionRecord({
  id: SystemAdminSessionId.make("system-admin-session-mock"),
  adminId: mockSystemAdmin.id,
  tokenDigest: "digest:system-admin-session-token-mock",
  active: true,
})

const mockGymUser = new GymUserRegistrationRecord({
  id: GymUserId.make("gym-user-mock"),
  email: "mock@example.com",
  displayName: "Mock User",
  emailVerified: true,
})

const mockGymUserSession = new GymUserSessionRecord({
  id: GymUserSessionId.make("gym-user-session-mock"),
  userId: mockGymUser.id,
  tokenDigest: "digest:gym-user-session-token-mock",
  active: true,
})

const mockGym = new GymRecord({
  id: GymId.make("gym-mock"),
  name: "Mock Gym",
  status: "active",
})

const mockGymCreationRequest = new GymCreationRequestRecord({
  id: GymCreationRequestId.make("gym-creation-request-mock"),
  gymId: mockGym.id,
  requesterUserId: mockGymUser.id,
  status: "approved",
})

const mockOwnerAffiliation = new GymAffiliationRecord({
  gymId: mockGym.id,
  userId: mockGymUser.id,
  role: "Owner",
  status: "active",
})

export const AuthMock = Layer.succeed(Auth, {
  signUpGymUser: (input) =>
    Effect.succeed(
      new GymUserSignupSuccess({
        user: new GymUserRegistrationRecord({
          id: GymUserId.make("gym-user-mock"),
          email: input.email,
          displayName: input.displayName,
          emailVerified: false,
        }),
      })
    ),
  verifyGymUserEmail: () =>
    Effect.succeed(
      new GymUserEmailVerificationSuccess({
        user: new GymUserRegistrationRecord({
          id: GymUserId.make("gym-user-mock"),
          email: "mock@example.com",
          displayName: "Mock User",
          emailVerified: true,
        }),
      })
    ),
  reserveGymUserEmail: (input) =>
    Effect.succeed(
      new GymUserRegistrationRecord({
        id: GymUserId.make("gym-user-mock"),
        email: input.email,
        displayName: input.displayName,
        emailVerified: false,
      })
    ),
  loginGymUser: (input) =>
    Effect.succeed(
      new GymUserLoginSuccess({
        user: new GymUserRegistrationRecord({
          id: mockGymUser.id,
          email: input.email,
          displayName: mockGymUser.displayName,
          emailVerified: true,
        }),
        sessionToken: GymUserSessionId.make("gym-user-session-token-mock"),
        session: mockGymUserSession,
      })
    ),
  currentGymUserSession: () =>
    Effect.succeed(
      new CurrentGymUserSessionSuccess({
        user: mockGymUser,
        session: mockGymUserSession,
        activeAffiliations: [mockOwnerAffiliation],
      })
    ),
  logoutGymUser: () => Effect.void,
  requestGymUserPasswordReset: (input) =>
    Effect.succeed(
      new GymUserPasswordResetRequested({
        email: input.email,
      })
    ),
  completeGymUserPasswordReset: () =>
    Effect.succeed(
      new GymUserPasswordResetCompleted({
        user: mockGymUser,
      })
    ),
  requestGymCreation: (input) => {
    const gym = new GymRecord({
      id: mockGym.id,
      name: input.name,
      status: "pending",
    })
    return Effect.succeed(
      new GymCreationRequested({
        gym,
        request: new GymCreationRequestRecord({
          id: GymCreationRequestId.make("gym-creation-request-mock"),
          gymId: gym.id,
          requesterUserId: mockGymUser.id,
          status: "pending",
        }),
      })
    )
  },
  approveGymCreationRequest: () =>
    Effect.succeed(
      new GymCreationRequestApproved({
        request: mockGymCreationRequest,
        gym: mockGym,
        ownerAffiliation: mockOwnerAffiliation,
      })
    ),
  currentGymOwnerAccess: () =>
    Effect.succeed(
      new CurrentGymOwnerAccessSuccess({
        gym: mockGym,
        affiliation: mockOwnerAffiliation,
      })
    ),
  joinGymAsMember: () => {
    const affiliation = new GymAffiliationRecord({
      gymId: mockGym.id,
      userId: mockGymUser.id,
      role: "Member",
      status: "active",
    })
    return Effect.succeed(
      new GymMemberJoined({
        gym: mockGym,
        affiliation,
      })
    )
  },
  leaveGymAsMember: () => {
    const affiliation = new GymAffiliationRecord({
      gymId: mockGym.id,
      userId: mockGymUser.id,
      role: "Member",
      status: "left",
    })
    return Effect.succeed(
      new GymMemberLeft({
        gym: mockGym,
        affiliation,
      })
    )
  },
  createGymStaffInvitation: (input) => {
    const invitation = new GymStaffInvitationRecord({
      id: GymStaffInvitationId.make("gym-staff-invitation-mock"),
      gymId: input.gymId,
      invitedEmail: input.email,
      invitedByUserId: mockGymUser.id,
      token: "gym-staff-invitation-token-mock",
      status: "pending",
    })
    return Effect.succeed(
      new GymStaffInvitationCreated({
        gym: mockGym,
        invitation,
      })
    )
  },
  acceptGymStaffInvitation: () => {
    const invitation = new GymStaffInvitationRecord({
      id: GymStaffInvitationId.make("gym-staff-invitation-mock"),
      gymId: mockGym.id,
      invitedEmail: mockGymUser.email,
      invitedByUserId: mockOwnerAffiliation.userId,
      token: "gym-staff-invitation-token-mock",
      status: "accepted",
    })
    const affiliation = new GymAffiliationRecord({
      gymId: mockGym.id,
      userId: mockGymUser.id,
      role: "Staff",
      status: "active",
    })
    return Effect.succeed(
      new GymStaffInvitationAccepted({
        gym: mockGym,
        invitation,
        affiliation,
      })
    )
  },
  bootstrapFirstSystemAdmin: (input) =>
    Effect.succeed(
      new FirstSystemAdminCreated({
        admin: new SystemAdminRecord({
          id: SystemAdminId.make("system-admin-mock"),
          email: input.email,
        }),
        credential: new SystemAdminCredentialRecord({
          adminId: SystemAdminId.make("system-admin-mock"),
          passwordHash: "hashed:mock",
        }),
      })
    ),
  loginSystemAdmin: (input) =>
    Effect.succeed(
      new SystemAdminLoginSuccess({
        admin: new SystemAdminRecord({
          id: mockSystemAdmin.id,
          email: input.email,
        }),
        sessionToken: SystemAdminSessionId.make(
          "system-admin-session-token-mock"
        ),
        session: mockSystemAdminSession,
      })
    ),
  currentSystemAdminSession: () =>
    Effect.succeed(
      new CurrentSystemAdminSessionSuccess({
        admin: mockSystemAdmin,
        session: mockSystemAdminSession,
      })
    ),
  logoutSystemAdmin: () => Effect.void,
})
