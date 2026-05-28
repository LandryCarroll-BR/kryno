import { Effect, Layer } from "effect"
import { GymUserRegistration } from "../application/gym-user-registration/gym-user-registration-input-boundary.ts"
import { SystemAdminAuthentication } from "../application/system-admin-authentication/system-admin-authentication-input-boundary.ts"
import { SystemAdminBootstrap } from "../application/system-admin-bootstrap/system-admin-bootstrap-input-boundary.ts"
import { Auth } from "../auth.ts"

export const AuthLive = Layer.effect(
  Auth,
  Effect.gen(function* () {
    const gymUserRegistration = yield* GymUserRegistration
    const systemAdminAuthentication = yield* SystemAdminAuthentication
    const systemAdminBootstrap = yield* SystemAdminBootstrap

    return {
      reserveGymUserEmail: gymUserRegistration.reserveEmail,
      bootstrapFirstSystemAdmin: systemAdminBootstrap.bootstrapFirstAdmin,
      loginSystemAdmin: systemAdminAuthentication.login,
      currentSystemAdminSession: systemAdminAuthentication.currentSession,
      logoutSystemAdmin: systemAdminAuthentication.logout,
    }
  })
)
