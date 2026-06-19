import type { Effect } from "effect"
import { Service } from "effect/Context"

import { SessionSecret, SessionSecretHash } from "../models/session.models"

export class SessionService extends Service<
  SessionService,
  {
    hashSessionSecret: (
      secret: SessionSecret
    ) => Effect.Effect<SessionSecretHash>
  }
>()("@workspace/auth/application/services/session-service") {}
