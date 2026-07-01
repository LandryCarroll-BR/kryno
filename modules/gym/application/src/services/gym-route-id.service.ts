import type { Effect } from "effect"
import { Service } from "effect/Context"

import type { GymRouteId } from "../models/gym-route.models"

export class GymRouteIdService extends Service<
  GymRouteIdService,
  {
    readonly generate: () => Effect.Effect<GymRouteId>
  }
>()("@gym/application/GymRouteIdService") {}
