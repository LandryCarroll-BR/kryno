import type { Effect, Option } from "effect"
import { Service } from "effect/Context"

import type { ClimberId } from "../models/climber.models"
import type {
  ActiveClimbingSession,
  CompletedClimbingSession,
} from "../models/climbing-session.models"

export class ClimbingSessionRepository extends Service<
  ClimbingSessionRepository,
  {
    readonly findActiveByClimberId: (
      climberId: ClimberId
    ) => Effect.Effect<Option.Option<ActiveClimbingSession>>

    readonly insertActive: (
      session: ActiveClimbingSession
    ) => Effect.Effect<Option.Option<ActiveClimbingSession>>

    readonly endActiveByClimberId: (
      climberId: ClimberId,
      endedAt: Date
    ) => Effect.Effect<Option.Option<CompletedClimbingSession>>
  }
>()("@climbing/application/ClimbingSessionRepository") {}
