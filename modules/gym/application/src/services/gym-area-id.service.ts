import type { Effect } from "effect"
import { Service } from "effect/Context"

import type { GymAreaId } from "../models/gym-area.models"

export class GymAreaIdService extends Service<
  GymAreaIdService,
  {
    readonly generate: () => Effect.Effect<GymAreaId>
  }
>()("@gym/application/GymAreaIdService") {}
