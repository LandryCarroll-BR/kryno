import type { Effect } from "effect"
import { Service } from "effect/Context"

import {
  SessionId,
  SessionSecret,
  SessionSecretHash,
} from "../models/session.models"

export class SessionService extends Service<
  SessionService,
  {
    readonly generateSessionId: () => Effect.Effect<SessionId>
    readonly generateSessionSecret: () => Effect.Effect<SessionSecret>
    readonly hashSessionSecret: (
      secret: SessionSecret
    ) => Effect.Effect<SessionSecretHash>
    readonly verifySessionSecret: (params: {
      secret: SessionSecret
      secretHash: SessionSecretHash
    }) => Effect.Effect<boolean>
  }
>()("@auth/application/SessionService") {}
