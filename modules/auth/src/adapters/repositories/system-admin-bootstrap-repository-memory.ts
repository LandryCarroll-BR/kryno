import { Effect, Layer, Option } from "effect"

import { normalizeEmailIdentity } from "../../domain/email-identity.ts"
import {
  SystemAdminRecord,
  SystemAdminSessionRecord,
  type SystemAdminCredentialRecord,
} from "../../domain/system-admin.ts"
import { SystemAdminBootstrapRepository } from "../../ports/repositories/system-admin-bootstrap-repository.ts"

export const SystemAdminBootstrapRepositoryMemoryAdapter = Layer.sync(
  SystemAdminBootstrapRepository,
  () => {
    let firstAdmin: SystemAdminRecord | undefined
    let firstAdminCredential: SystemAdminCredentialRecord | undefined
    const sessionsById = new Map<string, SystemAdminSessionRecord>()
    const sessionIdsByTokenDigest = new Map<string, string>()

    return {
      findFirstAdmin: Effect.sync(() => Option.fromNullishOr(firstAdmin)),
      findAdminByEmail: (email: string) =>
        Effect.sync(() =>
          firstAdmin !== undefined &&
          normalizeEmailIdentity(firstAdmin.email) === normalizeEmailIdentity(email)
            ? Option.some(firstAdmin)
            : Option.none()
        ),
      findCredentialByAdminId: (adminId: SystemAdminRecord["id"]) =>
        Effect.sync(() =>
          firstAdminCredential?.adminId === adminId
            ? Option.some(firstAdminCredential)
            : Option.none()
        ),
      findSessionByTokenDigest: (tokenDigest: string) =>
        Effect.sync(() => {
          const sessionId = sessionIdsByTokenDigest.get(tokenDigest)
          return Option.fromNullishOr(
            sessionId === undefined ? undefined : sessionsById.get(sessionId)
          )
        }),
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
      saveSession: (session: SystemAdminSessionRecord) =>
        Effect.sync(() => {
          sessionsById.set(session.id, session)
          sessionIdsByTokenDigest.set(session.tokenDigest, session.id)
        }),
      invalidateSession: (sessionId: SystemAdminSessionRecord["id"]) =>
        Effect.sync(() => {
          const session = sessionsById.get(sessionId)
          if (session !== undefined) {
            sessionsById.set(
              sessionId,
              new SystemAdminSessionRecord({
                id: session.id,
                adminId: session.adminId,
                tokenDigest: session.tokenDigest,
                expiresAtMillis: session.expiresAtMillis,
                active: false,
              })
            )
          }
        }),
    }
  }
)
