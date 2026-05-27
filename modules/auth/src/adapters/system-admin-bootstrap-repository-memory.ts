import { Effect, Layer, Option } from "effect"

import type {
  SystemAdminCredentialRecord,
  SystemAdminRecord,
} from "../domain/system-admin.ts"
import { SystemAdminBootstrapRepository } from "../ports/system-admin-bootstrap-repository.ts"

export const SystemAdminBootstrapRepositoryMemoryAdapter = Layer.sync(
  SystemAdminBootstrapRepository,
  () => {
    let firstAdmin: SystemAdminRecord | undefined
    let firstAdminCredential: SystemAdminCredentialRecord | undefined

    return {
      findFirstAdmin: Effect.sync(() => Option.fromNullable(firstAdmin)),
      saveFirstAdmin: (
        admin: SystemAdminRecord,
        credential: SystemAdminCredentialRecord
      ) =>
        Effect.sync(() => {
          if (firstAdmin === undefined) {
            firstAdmin = admin
            firstAdminCredential = credential
          }
          void firstAdminCredential
        }),
    }
  }
)
