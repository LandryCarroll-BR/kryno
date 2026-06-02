import { Effect, Option } from "effect"
import * as Context from "effect/Context"

import type {
  SystemAdminCredentialRecord,
  SystemAdminRecord,
  SystemAdminSessionId,
  SystemAdminSessionRecord,
} from "../../domain/system-admin.ts"

export class SystemAdminBootstrapRepository extends Context.Service<
  SystemAdminBootstrapRepository,
  {
    readonly findFirstAdmin: Effect.Effect<Option.Option<SystemAdminRecord>>
    readonly findAdminByEmail: (
      email: string
    ) => Effect.Effect<Option.Option<SystemAdminRecord>>
    readonly findCredentialByAdminId: (
      adminId: SystemAdminRecord["id"]
    ) => Effect.Effect<Option.Option<SystemAdminCredentialRecord>>
    readonly findSessionByTokenDigest: (
      tokenDigest: string
    ) => Effect.Effect<Option.Option<SystemAdminSessionRecord>>
    readonly saveFirstAdmin: (
      admin: SystemAdminRecord,
      credential: SystemAdminCredentialRecord
    ) => Effect.Effect<void>
    readonly saveSession: (
      session: SystemAdminSessionRecord
    ) => Effect.Effect<void>
    readonly invalidateSession: (
      sessionId: SystemAdminSessionId
    ) => Effect.Effect<void>
  }
>()("@kryno/auth/SystemAdminBootstrapRepository") {}
