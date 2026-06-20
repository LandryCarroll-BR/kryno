import type { Effect } from "effect"
import { Service } from "effect/Context"

import { SessionSecret, SessionSecretHash } from "../models/session.models"

export class SessionService extends Service<
  SessionService,
  {
    readonly hashSessionSecret: (
      secret: SessionSecret
    ) => Effect.Effect<SessionSecretHash>
  }
>()("@auth/application/SessionService") {}
