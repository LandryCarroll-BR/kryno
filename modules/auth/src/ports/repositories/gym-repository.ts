import { Effect, Option } from "effect"
import * as Context from "effect/Context"

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
    ) => Effect.Effect<Option.Option<GymRecord>>
    readonly findCreationRequestById: (
      requestId: GymCreationRequestId
    ) => Effect.Effect<Option.Option<GymCreationRequestRecord>>
    readonly findAffiliation: (
      gymId: GymId,
      userId: GymUserId
    ) => Effect.Effect<Option.Option<GymAffiliationRecord>>
    readonly findActiveAffiliationsByUserId: (
      userId: GymUserId
    ) => Effect.Effect<readonly GymAffiliationRecord[]>
    readonly saveGym: (gym: GymRecord) => Effect.Effect<void>
    readonly saveCreationRequest: (
      request: GymCreationRequestRecord
    ) => Effect.Effect<void>
    readonly saveAffiliation: (
      affiliation: GymAffiliationRecord
    ) => Effect.Effect<void>
  }
>()("@kryno/auth/GymRepository") {}
