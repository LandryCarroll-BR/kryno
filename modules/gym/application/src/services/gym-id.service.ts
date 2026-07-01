import type { Effect } from "effect"
import { Service } from "effect/Context"

import type { GymId } from "../models/gym.models"

export class GymIdService extends Service<
  GymIdService,
  {
    readonly generate: () => Effect.Effect<GymId>
  }
>()("@gym/application/GymIdService") {}
