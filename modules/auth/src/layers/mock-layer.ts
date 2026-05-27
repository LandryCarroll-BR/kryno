import { Effect, Layer } from "effect"
import { Auth } from "../auth.ts"
import { GymUserId } from "../domain/gym-user.ts"
import {
  FirstSystemAdminCreated,
  SystemAdminCredentialRecord,
  SystemAdminId,
  SystemAdminRecord,
} from "../domain/system-admin.ts"

export const AuthMock = Layer.succeed(Auth, {
  reserveGymUserEmail: (input) =>
    Effect.succeed({
      id: GymUserId.make("gym-user-mock"),
      email: input.email,
      displayName: input.displayName,
    }),
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
})

