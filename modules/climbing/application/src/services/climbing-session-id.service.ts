import type { Effect } from "effect"
import { Service } from "effect/Context"

import type { ClimbingSessionId } from "../models/climbing-session.models"

export class ClimbingSessionIdService extends Service<
  ClimbingSessionIdService,
  {
    readonly generate: () => Effect.Effect<ClimbingSessionId>
  }
>()("@climbing/application/ClimbingSessionIdService") {}
