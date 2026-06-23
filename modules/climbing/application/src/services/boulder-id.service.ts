import type { Effect } from "effect"
import { Service } from "effect/Context"

import type { BoulderId } from "../models/boulder.models"

export class BoulderIdService extends Service<
  BoulderIdService,
  {
    readonly generate: () => Effect.Effect<BoulderId>
  }
>()("@climbing/application/BoulderIdService") {}
