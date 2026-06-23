import type { Effect } from "effect"
import { Service } from "effect/Context"

import type { ClimbingAttemptId } from "../models/climbing-attempt.models"

export class ClimbingAttemptIdService extends Service<
  ClimbingAttemptIdService,
  {
    readonly generate: () => Effect.Effect<ClimbingAttemptId>
  }
>()("@climbing/application/ClimbingAttemptIdService") {}
