import type { Effect } from "effect"
import { Service } from "effect/Context"
import type { BoulderId } from "@climbing/application/models/boulder"
import type {
  ClimbingAttempt,
  ClimbingAttemptMoveType,
  ClimbingAttemptOutcome,
  ClimbingAttemptVideoUpload,
} from "@climbing/application/models/climbing-attempt"
import type { ClimbingSessionId } from "@climbing/application/models/climbing-session"
import type { Option } from "effect"

import type { NoActiveGymClimbingSessionError } from "../errors/gym-climbing.errors"
import type { UnauthenticatedGymMemberError } from "../errors/gym-membership.errors"
import type { GymRouteBoulderUnavailableError } from "../errors/gym-route.errors"
import type { GymMemberId } from "../models/gym-membership.models"
import type { GymRouteId } from "../models/gym-route.models"

export class GymBoulderAttempts extends Service<
  GymBoulderAttempts,
  {
    readonly listForBoulders: (input: {
      readonly token: string
      readonly memberId: GymMemberId
      readonly boulderIds: readonly BoulderId[]
    }) => Effect.Effect<
      readonly GymBoulderAttemptHistory[],
      UnauthenticatedGymMemberError
    >
    readonly log: (input: {
      readonly token: string
      readonly memberId: GymMemberId
      readonly routeId: GymRouteId
      readonly boulderId: BoulderId
      readonly outcome: ClimbingAttemptOutcome
      readonly moveTypes: readonly ClimbingAttemptMoveType[]
      readonly video?: ClimbingAttemptVideoUpload
    }) => Effect.Effect<
      ClimbingAttempt,
      | UnauthenticatedGymMemberError
      | NoActiveGymClimbingSessionError
      | GymRouteBoulderUnavailableError
    >
  }
>()("@gym/application/GymBoulderAttempts") {}

export type GymBoulderAttemptHistorySession = {
  readonly id: ClimbingSessionId
  readonly startedAt: Date
  readonly endedAt: Option.Option<Date>
  readonly attempts: readonly ClimbingAttempt[]
}

export type GymBoulderAttemptHistory = {
  readonly boulderId: BoulderId
  readonly sessions: readonly GymBoulderAttemptHistorySession[]
}
