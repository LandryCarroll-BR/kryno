import type { Effect } from "effect"
import { Service } from "effect/Context"

import {
  SessionCookie,
  SessionId,
  SessionSecret,
  SessionSecretHash,
} from "@/session/session.models"

export class SessionService extends Service<
  SessionService,
  {
    generateId: () => Effect.Effect<SessionId>
    generateSecret: () => Effect.Effect<SessionSecret>
    hashSecret: (secret: SessionSecret) => Effect.Effect<SessionSecretHash>
    createSessionCookie: () => Effect.Effect<SessionCookie>
  }
>()("@workspace/auth/application/services/session-service") {}
