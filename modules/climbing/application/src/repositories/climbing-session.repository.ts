import type { Effect, Option } from "effect"
import { Service } from "effect/Context"

import type { ClimberId } from "../models/climber.models"
import type { ActiveClimbingSession } from "../models/climbing-session.models"

export class ClimbingSessionRepository extends Service<
  ClimbingSessionRepository,
  {
    readonly findActiveByClimberId: (
      climberId: ClimberId
    ) => Effect.Effect<Option.Option<ActiveClimbingSession>>
    readonly createActive: (
      session: ActiveClimbingSession
    ) => Effect.Effect<ActiveClimbingSession>
  }
>()("@climbing/application/ClimbingSessionRepository") {}
