import type { Effect } from "effect"
import { Service } from "effect/Context"

import {
  SessionCookie,
  SessionSecret,
  SessionSecretHash,
  SessionWithToken,
} from "../models/session.models"

export class SessionService extends Service<
  SessionService,
  {
    hashSessionSecret: (
      secret: SessionSecret
    ) => Effect.Effect<SessionSecretHash>
    createSessionCookie: (
      session: SessionWithToken
    ) => Effect.Effect<SessionCookie>
  }
>()("@workspace/auth/application/services/session-service") {}
