import { Effect, Option } from "effect"
import * as Context from "effect/Context"
import type { PersistenceError } from "@workspace/drizzle"

import type {
  GymUserCredentialRecord,
  GymUserEmailVerificationTokenRecord,
  GymUserId,
  GymUserPasswordResetTokenRecord,
  GymUserRegistrationRecord,
  GymUserSessionId,
  GymUserSessionRecord,
} from "../../domain/gym-user.ts"

export class GymUserRegistrationRepository extends Context.Service<
  GymUserRegistrationRepository,
  {
    readonly findById: (
      userId: GymUserId
    ) => Effect.Effect<Option.Option<GymUserRegistrationRecord>, PersistenceError>
    readonly findByEmail: (
      email: string
    ) => Effect.Effect<Option.Option<GymUserRegistrationRecord>, PersistenceError>
    readonly findCredentialByUserId: (
      userId: GymUserId
    ) => Effect.Effect<Option.Option<GymUserCredentialRecord>, PersistenceError>
    readonly findSessionByTokenDigest: (
      tokenDigest: string
    ) => Effect.Effect<Option.Option<GymUserSessionRecord>, PersistenceError>
    readonly save: (
      record: GymUserRegistrationRecord
    ) => Effect.Effect<void, PersistenceError>
    readonly saveCredential: (
      credential: GymUserCredentialRecord
    ) => Effect.Effect<void, PersistenceError>
    readonly saveEmailVerificationToken: (
      token: GymUserEmailVerificationTokenRecord
    ) => Effect.Effect<void, PersistenceError>
    readonly findEmailVerificationToken: (
      token: string
    ) => Effect.Effect<
      Option.Option<GymUserEmailVerificationTokenRecord>,
      PersistenceError
    >
    readonly savePasswordResetToken: (
      token: GymUserPasswordResetTokenRecord
    ) => Effect.Effect<void, PersistenceError>
    readonly findPasswordResetToken: (
      token: string
    ) => Effect.Effect<Option.Option<GymUserPasswordResetTokenRecord>, PersistenceError>
    readonly saveSession: (
      session: GymUserSessionRecord
    ) => Effect.Effect<void, PersistenceError>
    readonly invalidateSession: (
      sessionId: GymUserSessionId,
      revokedAtMillis: number
    ) => Effect.Effect<void, PersistenceError>
  }
>()("@kryno/auth/GymUserRegistrationRepository") {}
