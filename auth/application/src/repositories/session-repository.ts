import type { Session, SessionId } from "@/entites/session-entities"
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
