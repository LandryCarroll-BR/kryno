import type { Session, SessionId } from "../models/session.models"
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
>()("@auth/application/SessionRepository") {}
