import type { Effect } from "effect"
import { Service } from "effect/Context"

import type { Boulder } from "../models/boulder.models"

export class BoulderRepository extends Service<
  BoulderRepository,
  {
    readonly insert: (boulder: Boulder) => Effect.Effect<Boulder>
  }
>()("@climbing/application/BoulderRepository") {}
