import type { Effect, Option } from "effect"
import { Service } from "effect/Context"

import type { GymAreaId } from "../models/gym-area.models"
import type { BoulderId } from "../models/gym-route.models"
import type {
  GymRoute,
  GymRouteId,
} from "../models/gym-route.models"

export class GymRouteRepository extends Service<
  GymRouteRepository,
  {
    readonly findByAreaIds: (
      areaIds: readonly GymAreaId[]
    ) => Effect.Effect<readonly GymRoute[]>
    readonly findByBoulderIds: (
      boulderIds: readonly BoulderId[]
    ) => Effect.Effect<readonly GymRoute[]>
    readonly findById: (
      routeId: GymRouteId
    ) => Effect.Effect<Option.Option<GymRoute>>
    readonly deleteById: (
      routeId: GymRouteId
    ) => Effect.Effect<Option.Option<GymRoute>>
    readonly insert: (
      route: GymRoute
    ) => Effect.Effect<Option.Option<GymRoute>>
    readonly update: (
      route: GymRoute
    ) => Effect.Effect<Option.Option<GymRoute>>
  }
>()("@gym/application/GymRouteRepository") {}
