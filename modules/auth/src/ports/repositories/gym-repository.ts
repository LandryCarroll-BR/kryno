import { Effect, Option } from "effect"
import * as Context from "effect/Context"
import type { PersistenceError } from "@workspace/drizzle"

import type {
  GymAffiliationRecord,
  GymCreationRequestId,
  GymCreationRequestRecord,
  GymId,
  GymRecord,
} from "../../domain/gym.ts"
import type { GymUserId } from "../../domain/gym-user.ts"

export class GymRepository extends Context.Service<
  GymRepository,
  {
    readonly findGymById: (
      gymId: GymId
    ) => Effect.Effect<Option.Option<GymRecord>, PersistenceError>
    readonly findCreationRequestById: (
      requestId: GymCreationRequestId
    ) => Effect.Effect<Option.Option<GymCreationRequestRecord>, PersistenceError>
    readonly findAffiliation: (
      gymId: GymId,
      userId: GymUserId
    ) => Effect.Effect<Option.Option<GymAffiliationRecord>, PersistenceError>
    readonly findActiveAffiliationsByUserId: (
      userId: GymUserId
    ) => Effect.Effect<readonly GymAffiliationRecord[], PersistenceError>
    readonly saveGym: (gym: GymRecord) => Effect.Effect<void, PersistenceError>
    readonly saveCreationRequest: (
      request: GymCreationRequestRecord
    ) => Effect.Effect<void, PersistenceError>
    readonly saveAffiliation: (
      affiliation: GymAffiliationRecord
    ) => Effect.Effect<void, PersistenceError>
  }
>()("@kryno/auth/GymRepository") {}
