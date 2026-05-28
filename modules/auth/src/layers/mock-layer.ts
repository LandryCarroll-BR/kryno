import { Effect, Layer } from "effect"
import { Auth } from "../auth.ts"
import {
  GymUserEmailVerificationSuccess,
  GymUserId,
  GymUserRegistrationRecord,
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
  active: true,
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
