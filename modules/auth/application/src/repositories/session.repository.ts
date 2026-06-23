import type { PersistedSession, SessionId } from "../models/session.models"
import { Effect, Option } from "effect"
import { Service } from "effect/Context"

export class SessionRepository extends Service<
  SessionRepository,
  {
    readonly create: (
      session: PersistedSession
    ) => Effect.Effect<PersistedSession>

    readonly update: (
      session: PersistedSession
    ) => Effect.Effect<PersistedSession>

    readonly findById: (
      id: SessionId
    ) => Effect.Effect<Option.Option<PersistedSession>>

    readonly delete: (id: SessionId) => Effect.Effect<SessionId>
  }
>()("@auth/application/SessionRepository") {}
