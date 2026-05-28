import { Effect, Layer, Option } from "effect"

import type {
  GymAffiliationRecord,
  GymCreationRequestRecord,
  GymRecord,
} from "../../domain/gym.ts"
import { GymRepository } from "../../ports/repositories/gym-repository.ts"

export const GymRepositoryMemoryAdapter = Layer.sync(GymRepository, () => {
  const gymsById = new Map<string, GymRecord>()
  const creationRequestsById = new Map<string, GymCreationRequestRecord>()
  const affiliationsByGymAndUser = new Map<string, GymAffiliationRecord>()

  const affiliationKey = (gymId: string, userId: string) => `${gymId}:${userId}`

  return {
    findGymById: (gymId: GymRecord["id"]) =>
      Effect.sync(() => Option.fromNullishOr(gymsById.get(gymId))),
    findCreationRequestById: (requestId: GymCreationRequestRecord["id"]) =>
      Effect.sync(() =>
        Option.fromNullishOr(creationRequestsById.get(requestId))
      ),
    findAffiliation: (
      gymId: GymAffiliationRecord["gymId"],
      userId: GymAffiliationRecord["userId"]
    ) =>
      Effect.sync(() =>
        Option.fromNullishOr(
          affiliationsByGymAndUser.get(affiliationKey(gymId, userId))
        )
      ),
    saveGym: (gym: GymRecord) =>
      Effect.sync(() => {
        gymsById.set(gym.id, gym)
      }),
    saveCreationRequest: (request: GymCreationRequestRecord) =>
      Effect.sync(() => {
        creationRequestsById.set(request.id, request)
      }),
    saveAffiliation: (affiliation: GymAffiliationRecord) =>
      Effect.sync(() => {
        affiliationsByGymAndUser.set(
          affiliationKey(affiliation.gymId, affiliation.userId),
          affiliation
        )
      }),
  }
})
