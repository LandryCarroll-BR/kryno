import { Effect, Layer, Option } from "effect"

import {
  GymUserId,
  SystemAdminId,
  type GymUserRegistrationRecord,
  type SystemAdminCredentialRecord,
  type SystemAdminRecord,
} from "../domain/index.ts"
import {
  AuthIdGenerator,
  GymUserRegistrationLayer,
  GymUserRegistrationRepository,
  PasswordHasher,
  SystemAdminBootstrapLayer,
  SystemAdminBootstrapRepository,
} from "../services/index.ts"

export const InMemoryGymUserRegistrationRepositoryLayer = Layer.sync(
  GymUserRegistrationRepository,
  () => {
    const recordsByEmail = new Map<string, GymUserRegistrationRecord>()

    return {
      findByEmail: (email: string) =>
        Effect.sync(() => Option.fromNullable(recordsByEmail.get(email))),
      save: (record: GymUserRegistrationRecord) =>
        Effect.sync(() => {
          recordsByEmail.set(record.email, record)
        }),
    }
  }
)

export const SequentialAuthIdGeneratorLayer = Layer.sync(
  AuthIdGenerator,
  () => {
    let nextGymUserId = 1
    let nextSystemAdminId = 1

    return {
      nextGymUserId: Effect.sync(() =>
        GymUserId.make(`gym-user-${nextGymUserId++}`)
      ),
      nextSystemAdminId: Effect.sync(() =>
        SystemAdminId.make(`system-admin-${nextSystemAdminId++}`)
      ),
    }
  }
)

export const DeterministicPasswordHasherLayer = Layer.succeed(PasswordHasher, {
  hashPassword: (password: string) => Effect.succeed(`hashed:${password}`),
})

export const InMemorySystemAdminBootstrapRepositoryLayer = Layer.sync(
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

export const AuthTestLayer = Layer.merge(
  GymUserRegistrationLayer,
  SystemAdminBootstrapLayer
).pipe(
  Layer.provideMerge(InMemoryGymUserRegistrationRepositoryLayer),
  Layer.provideMerge(InMemorySystemAdminBootstrapRepositoryLayer),
  Layer.provideMerge(SequentialAuthIdGeneratorLayer),
  Layer.provideMerge(DeterministicPasswordHasherLayer)
)
