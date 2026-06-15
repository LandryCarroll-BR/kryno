import type { Session } from "@/session/session.models"
import type { SessionId } from "@/session/session.models"
import { Effect, Option } from "effect"
import { Service } from "effect/Context"

export class SessionRepository extends Service<
  SessionRepository,
  {
    create: (session: Session) => Effect.Effect<Session>
    update: (session: Session) => Effect.Effect<Session>
    findById: (id: SessionId) => Effect.Effect<Option.Option<Session>>
    delete: (id: SessionId) => Effect.Effect<SessionId>
  }
>()("@workspace/auth/application/repositories/session-repository") {}
