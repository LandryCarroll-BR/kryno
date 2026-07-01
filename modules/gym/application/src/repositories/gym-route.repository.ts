import type { Effect, Option } from "effect"
import { Service } from "effect/Context"

import type { GymAreaId } from "../models/gym-area.models"
import type { GymRoute } from "../models/gym-route.models"

export class GymRouteRepository extends Service<
  GymRouteRepository,
  {
    readonly findByAreaIds: (
      areaIds: readonly GymAreaId[]
    ) => Effect.Effect<readonly GymRoute[]>
    readonly insert: (
      route: GymRoute
    ) => Effect.Effect<Option.Option<GymRoute>>
  }
>()("@gym/application/GymRouteRepository") {}
