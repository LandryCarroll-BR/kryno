import type { Effect, Option } from "effect"
import { Service } from "effect/Context"

import type {
  GymArea,
  GymAreaId,
} from "../models/gym-area.models"
import type { GymId } from "../models/gym.models"

export class GymAreaRepository extends Service<
  GymAreaRepository,
  {
    readonly findByGymId: (
      gymId: GymId
    ) => Effect.Effect<readonly GymArea[]>
    readonly findById: (
      areaId: GymAreaId
    ) => Effect.Effect<Option.Option<GymArea>>
    readonly insert: (
      area: GymArea
    ) => Effect.Effect<Option.Option<GymArea>>
  }
>()("@gym/application/GymAreaRepository") {}
