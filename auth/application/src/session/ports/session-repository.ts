import type { Session } from "@/session/domain/session-entities"
import type { SessionId } from "@/session/domain/session-value-objects"
import { Effect, Option } from "effect"
import { Service } from "effect/Context"

export class SessionRepository extends Service<
  SessionRepository,
  {
    create: (session: Session) => Effect.Effect<Session>
    findById: (id: SessionId) => Effect.Effect<Option.Option<Session>>
    deleteSession: (id: SessionId) => Effect.Effect<SessionId>
  }
>()("@workspace/auth/application/repositories/session-repository") {}
