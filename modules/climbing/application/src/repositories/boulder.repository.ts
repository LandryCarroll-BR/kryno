import type { Effect } from "effect"
import { Service } from "effect/Context"

import type { Boulder } from "../models/boulder.models"
import type { ClimberId } from "../models/climber.models"

export class BoulderRepository extends Service<
  BoulderRepository,
  {
    readonly findByCreatorClimberId: (
      climberId: ClimberId
    ) => Effect.Effect<readonly Boulder[]>
    readonly insert: (boulder: Boulder) => Effect.Effect<Boulder>
  }
>()("@climbing/application/BoulderRepository") {}
