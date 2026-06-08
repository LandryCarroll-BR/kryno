import type { Effect } from "effect"
import { Service } from "effect/Context"
import {
  SessionId,
  SessionSecret,
  SessionSecretHash,
} from "@/domain/session-value-objects"

export class SessionService extends Service<
  SessionService,
  {
    generateId: () => Effect.Effect<SessionId>
    generateSecret: () => Effect.Effect<SessionSecret>
    hashSecret: (secret: SessionSecret) => Effect.Effect<SessionSecretHash>
  }
>()("@workspace/auth/application/services/session-service") {}
