import { Effect, Layer } from "effect"

import { GymUserId, GymUserSessionId } from "../../domain/gym-user.ts"
import {
  SystemAdminId,
  SystemAdminSessionId,
} from "../../domain/system-admin.ts"
import { AuthIdGenerator } from "../../ports/services/auth-id-generator.ts"

export const AuthIdGeneratorSequentialAdapter = Layer.sync(
  AuthIdGenerator,
  () => {
    let nextGymUserId = 1
    let nextGymUserSessionId = 1
    let nextSystemAdminId = 1
    let nextSystemAdminSessionId = 1

    return {
      nextGymUserId: Effect.sync(() =>
        GymUserId.make(`gym-user-${nextGymUserId++}`)
      ),
      nextGymUserSessionId: Effect.sync(() =>
        GymUserSessionId.make(`gym-user-session-${nextGymUserSessionId++}`)
      ),
      nextSystemAdminId: Effect.sync(() =>
        SystemAdminId.make(`system-admin-${nextSystemAdminId++}`)
      ),
      nextSystemAdminSessionId: Effect.sync(() =>
        SystemAdminSessionId.make(
          `system-admin-session-${nextSystemAdminSessionId++}`
        )
      ),
    }
  }
)
