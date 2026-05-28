import { Effect, Option } from "effect"
import * as Context from "effect/Context"

import type {
  GymUserCredentialRecord,
  GymUserEmailVerificationTokenRecord,
  GymUserId,
  GymUserRegistrationRecord,
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
  }
>()("@kryno/auth/GymUserRegistrationRepository") {}
