import type { Effect, Option } from "effect"
import { Service } from "effect/Context"

import type { Boulder, BoulderId } from "../models/boulder.models"
import type { ClimberId } from "../models/climber.models"

export class BoulderRepository extends Service<
  BoulderRepository,
  {
    readonly findByCreatorClimberId: (
      climberId: ClimberId
    ) => Effect.Effect<readonly Boulder[]>

    readonly findSavedById: (
      climberId: ClimberId,
      boulderId: BoulderId
    ) => Effect.Effect<Option.Option<Boulder>>

    readonly insert: (boulder: Boulder) => Effect.Effect<Boulder>
  }
>()("@climbing/application/BoulderRepository") {}
