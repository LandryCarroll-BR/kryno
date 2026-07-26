import type { Effect } from "effect"
import { Service } from "effect/Context"
import type { BoulderId } from "@climbing/application/models/boulder"
import type {
  ClimbingAttempt,
  ClimbingAttemptOutcome,
} from "@climbing/application/models/climbing-attempt"

import type { NoActiveGymClimbingSessionError } from "../errors/gym-climbing.errors"
import type { UnauthenticatedGymMemberError } from "../errors/gym-membership.errors"
import type { GymRouteBoulderUnavailableError } from "../errors/gym-route.errors"
import type { GymMemberId } from "../models/gym-membership.models"
import type { GymRouteId } from "../models/gym-route.models"

export class GymBoulderAttempts extends Service<
  GymBoulderAttempts,
  {
    readonly log: (input: {
      readonly token: string
      readonly memberId: GymMemberId
      readonly routeId: GymRouteId
      readonly boulderId: BoulderId
      readonly outcome: ClimbingAttemptOutcome
    }) => Effect.Effect<
      ClimbingAttempt,
      | UnauthenticatedGymMemberError
      | NoActiveGymClimbingSessionError
      | GymRouteBoulderUnavailableError
    >
  }
>()("@gym/application/GymBoulderAttempts") {}
