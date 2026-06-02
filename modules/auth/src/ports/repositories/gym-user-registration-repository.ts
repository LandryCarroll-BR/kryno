import { Effect, Option } from "effect"
import * as Context from "effect/Context"

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
    ) => Effect.Effect<Option.Option<GymUserRegistrationRecord>>
    readonly findByEmail: (
      email: string
    ) => Effect.Effect<Option.Option<GymUserRegistrationRecord>>
    readonly findCredentialByUserId: (
      userId: GymUserId
    ) => Effect.Effect<Option.Option<GymUserCredentialRecord>>
    readonly findSessionByTokenDigest: (
      tokenDigest: string
    ) => Effect.Effect<Option.Option<GymUserSessionRecord>>
    readonly save: (record: GymUserRegistrationRecord) => Effect.Effect<void>
    readonly saveCredential: (
      credential: GymUserCredentialRecord
    ) => Effect.Effect<void>
    readonly saveEmailVerificationToken: (
      token: GymUserEmailVerificationTokenRecord
    ) => Effect.Effect<void>
    readonly findEmailVerificationToken: (
      token: string
    ) => Effect.Effect<Option.Option<GymUserEmailVerificationTokenRecord>>
    readonly savePasswordResetToken: (
      token: GymUserPasswordResetTokenRecord
    ) => Effect.Effect<void>
    readonly findPasswordResetToken: (
      token: string
    ) => Effect.Effect<Option.Option<GymUserPasswordResetTokenRecord>>
    readonly saveSession: (session: GymUserSessionRecord) => Effect.Effect<void>
    readonly invalidateSession: (
      sessionId: GymUserSessionId
    ) => Effect.Effect<void>
  }
>()("@kryno/auth/GymUserRegistrationRepository") {}
