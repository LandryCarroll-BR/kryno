import { Effect, Layer, Option } from "effect"
import * as Context from "effect/Context"

import {
  FirstSystemAdminAlreadyBootstrapped,
  FirstSystemAdminAlreadyExists,
  FirstSystemAdminCreated,
  SystemAdminCredentialRecord,
  SystemAdminRecord,
  type BootstrapFirstSystemAdminInput,
  type BootstrapFirstSystemAdminSuccess,
} from "../domain/index.ts"
import { AuthIdGenerator } from "./auth-id-generator.ts"
import { PasswordHasher } from "./password-hasher.ts"
import { SystemAdminBootstrapRepository } from "./system-admin-bootstrap-repository.ts"

export class SystemAdminBootstrap extends Context.Tag(
  "@kryno/auth/SystemAdminBootstrap"
)<
  SystemAdminBootstrap,
  {
    readonly bootstrapFirstAdmin: (
      input: BootstrapFirstSystemAdminInput
    ) => Effect.Effect<
      BootstrapFirstSystemAdminSuccess,
      FirstSystemAdminAlreadyExists
    >
  }
>() {}

export const SystemAdminBootstrapLayer = Layer.effect(
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
