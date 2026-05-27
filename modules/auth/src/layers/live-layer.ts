import { Effect, Layer } from "effect"
import { GymUserRegistration } from "../application/gym-user-registration/gym-user-registration-input-boundary.ts"
import { SystemAdminBootstrap } from "../application/system-admin-bootstrap/system-admin-bootstrap-input-boundary.ts"
import { Auth } from "../auth.ts"

export const AuthLive = Layer.effect(
  Auth,
  Effect.gen(function* () {
    const gymUserRegistration = yield* GymUserRegistration
    const systemAdminBootstrap = yield* SystemAdminBootstrap

    return {
      reserveGymUserEmail: gymUserRegistration.reserveEmail,
      bootstrapFirstSystemAdmin: systemAdminBootstrap.bootstrapFirstAdmin,
    }
  })
)
