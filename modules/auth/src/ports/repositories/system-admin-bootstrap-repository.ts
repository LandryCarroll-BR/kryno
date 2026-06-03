import { Effect, Option } from "effect"
import * as Context from "effect/Context"
import type { PersistenceError } from "@workspace/drizzle"

import type {
  SystemAdminCredentialRecord,
  SystemAdminRecord,
  SystemAdminSessionId,
  SystemAdminSessionRecord,
} from "../../domain/system-admin.ts"

export class SystemAdminBootstrapRepository extends Context.Service<
  SystemAdminBootstrapRepository,
  {
    readonly findFirstAdmin: Effect.Effect<
      Option.Option<SystemAdminRecord>,
      PersistenceError
    >
    readonly findAdminByEmail: (
      email: string
    ) => Effect.Effect<Option.Option<SystemAdminRecord>, PersistenceError>
    readonly findCredentialByAdminId: (
      adminId: SystemAdminRecord["id"]
    ) => Effect.Effect<Option.Option<SystemAdminCredentialRecord>, PersistenceError>
    readonly findSessionByTokenDigest: (
      tokenDigest: string
    ) => Effect.Effect<Option.Option<SystemAdminSessionRecord>, PersistenceError>
    readonly saveFirstAdmin: (
      admin: SystemAdminRecord,
      credential: SystemAdminCredentialRecord
    ) => Effect.Effect<void, PersistenceError>
    readonly saveSession: (
      session: SystemAdminSessionRecord
    ) => Effect.Effect<void, PersistenceError>
    readonly invalidateSession: (
      sessionId: SystemAdminSessionId
    ) => Effect.Effect<void, PersistenceError>
  }
>()("@kryno/auth/SystemAdminBootstrapRepository") {}
