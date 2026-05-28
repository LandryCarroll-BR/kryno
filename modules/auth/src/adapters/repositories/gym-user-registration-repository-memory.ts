import { Effect, Layer, Option } from "effect"

import type {
  GymUserCredentialRecord,
  GymUserEmailVerificationTokenRecord,
  GymUserRegistrationRecord,
} from "../../domain/gym-user.ts"
import { GymUserRegistrationRepository } from "../../ports/repositories/gym-user-registration-repository.ts"

export const GymUserRegistrationRepositoryMemoryAdapter = Layer.sync(
  GymUserRegistrationRepository,
  () => {
    const recordsById = new Map<string, GymUserRegistrationRecord>()
    const recordsByEmail = new Map<string, GymUserRegistrationRecord>()
    const credentialsByUserId = new Map<string, GymUserCredentialRecord>()
    const emailVerificationTokensByToken = new Map<
      string,
      GymUserEmailVerificationTokenRecord
    >()

    return {
      findById: (userId: GymUserRegistrationRecord["id"]) =>
        Effect.sync(() => Option.fromNullishOr(recordsById.get(userId))),
      findByEmail: (email: string) =>
        Effect.sync(() => Option.fromNullishOr(recordsByEmail.get(email))),
      findCredentialByUserId: (userId: GymUserRegistrationRecord["id"]) =>
        Effect.sync(() =>
          Option.fromNullishOr(credentialsByUserId.get(userId))
        ),
      save: (record: GymUserRegistrationRecord) =>
        Effect.sync(() => {
          recordsById.set(record.id, record)
          recordsByEmail.set(record.email, record)
        }),
      saveCredential: (credential: GymUserCredentialRecord) =>
        Effect.sync(() => {
          credentialsByUserId.set(credential.userId, credential)
        }),
      saveEmailVerificationToken: (
        token: GymUserEmailVerificationTokenRecord
      ) =>
        Effect.sync(() => {
          emailVerificationTokensByToken.set(token.token, token)
        }),
      findEmailVerificationToken: (token: string) =>
        Effect.sync(() =>
          Option.fromNullishOr(emailVerificationTokensByToken.get(token))
        ),
    }
  }
)
