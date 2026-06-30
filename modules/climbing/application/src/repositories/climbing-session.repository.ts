import type { Effect, Option } from "effect"
import { Service } from "effect/Context"

import type { ClimberId } from "../models/climber.models"
import type { BoulderId } from "../models/boulder.models"

import type {
  ClimbingAttempt,
  ClimbingAttemptId,
  ClimbingAttemptOutcome,
} from "../models/climbing-attempt.models"

import type {
  ActiveClimbingSession,
  ClimbingSession,
  CompletedClimbingSession,
} from "../models/climbing-session.models"

export class ClimbingSessionRepository extends Service<
  ClimbingSessionRepository,
  {
    readonly findActiveByClimberId: (
      climberId: ClimberId
    ) => Effect.Effect<Option.Option<ActiveClimbingSession>>

    readonly findAllByClimberId: (
      climberId: ClimberId
    ) => Effect.Effect<readonly ClimbingSession[]>

    readonly insertActive: (
      session: ActiveClimbingSession
    ) => Effect.Effect<Option.Option<ActiveClimbingSession>>

    readonly insertAttemptIntoActiveSession: (input: {
      readonly id: ClimbingAttemptId
      readonly climberId: ClimberId
      readonly boulderId: BoulderId
      readonly outcome: ClimbingAttemptOutcome
      readonly occurredAt: Date
    }) => Effect.Effect<Option.Option<ClimbingAttempt>>

    readonly endActiveByClimberId: (
      climberId: ClimberId,
      endedAt: Date
    ) => Effect.Effect<Option.Option<CompletedClimbingSession>>
  }
>()("@climbing/application/ClimbingSessionRepository") {}
