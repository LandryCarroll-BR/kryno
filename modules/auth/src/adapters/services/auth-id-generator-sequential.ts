import { Effect, Layer } from "effect"

import { GymUserId } from "../../domain/gym-user.ts"
import { SystemAdminId } from "../../domain/system-admin.ts"
import { AuthIdGenerator } from "../../ports/services/auth-id-generator.ts"

export const AuthIdGeneratorSequentialAdapter = Layer.sync(
  AuthIdGenerator,
  () => {
    let nextGymUserId = 1
    let nextSystemAdminId = 1

    return {
      nextGymUserId: Effect.sync(() =>
        GymUserId.make(`gym-user-${nextGymUserId++}`)
      ),
      nextSystemAdminId: Effect.sync(() =>
        SystemAdminId.make(`system-admin-${nextSystemAdminId++}`)
      ),
    }
  }
)
