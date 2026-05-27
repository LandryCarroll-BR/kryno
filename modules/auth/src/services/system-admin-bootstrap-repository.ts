import { Effect, Option } from "effect"
import * as Context from "effect/Context"

import type {
  SystemAdminCredentialRecord,
  SystemAdminRecord,
} from "../domain/index.ts"

export class SystemAdminBootstrapRepository extends Context.Tag(
  "@kryno/auth/SystemAdminBootstrapRepository"
)<
  SystemAdminBootstrapRepository,
  {
    readonly findFirstAdmin: Effect.Effect<Option.Option<SystemAdminRecord>>
    readonly saveFirstAdmin: (
      admin: SystemAdminRecord,
      credential: SystemAdminCredentialRecord
    ) => Effect.Effect<void>
  }
>() {}
