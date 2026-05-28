import { Effect, Layer, Option } from "effect"

import { FirstSystemAdminAlreadyExists } from "../../domain/errors.ts"
import {
  FirstSystemAdminAlreadyBootstrapped,
  FirstSystemAdminCreated,
  SystemAdminCredentialRecord,
  SystemAdminRecord,
  type BootstrapFirstSystemAdminInput,
} from "../../domain/system-admin.ts"
import { SystemAdminBootstrapRepository } from "../../ports/repositories/system-admin-bootstrap-repository.ts"
import { AuthIdGenerator } from "../../ports/services/auth-id-generator.ts"
import { PasswordHasher } from "../../ports/services/password-hasher.ts"
import { SystemAdminBootstrap } from "./system-admin-bootstrap-input-boundary.ts"

export const SystemAdminBootstrapInteractor = Layer.effect(
  SystemAdminBootstrap,
  Effect.gen(function* () {
    const ids = yield* AuthIdGenerator
    const passwordHasher = yield* PasswordHasher
    const repository = yield* SystemAdminBootstrapRepository

    const bootstrapFirstAdmin = Effect.fn(
      "SystemAdminBootstrap.bootstrapFirstAdmin"
    )((command: BootstrapFirstSystemAdminInput) =>
      Effect.gen(function* () {
        const existing = yield* repository.findFirstAdmin

        if (Option.isSome(existing)) {
          if (existing.value.email !== command.email) {
            return yield* new FirstSystemAdminAlreadyExists({
              existingAdminId: existing.value.id,
              requestedEmail: command.email,
            })
          }

          return new FirstSystemAdminAlreadyBootstrapped({
            admin: existing.value,
          })
        }

        const admin = new SystemAdminRecord({
          id: yield* ids.nextSystemAdminId,
          email: command.email,
        })
        const credential = new SystemAdminCredentialRecord({
          adminId: admin.id,
          passwordHash: yield* passwordHasher.hashPassword(command.password),
        })

        yield* repository.saveFirstAdmin(admin, credential)

        return new FirstSystemAdminCreated({ admin, credential })
      })
    )

    return { bootstrapFirstAdmin }
  })
)
