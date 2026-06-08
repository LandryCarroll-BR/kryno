import type {
  Session,
  SessionWithToken,
} from "@/session/domain/session-entities"
import type { Effect, Option } from "effect"
import { Service } from "effect/Context"

export class SessionInputBoundary extends Service<
  SessionInputBoundary,
  {
    createSession: () => Effect.Effect<SessionWithToken, unknown, unknown>
    validateSession: (
      token: string
    ) => Effect.Effect<Option.Option<Session>, unknown, unknown>
  }
>()("@workspace/auth/application/session/session-input-boundary") {}
