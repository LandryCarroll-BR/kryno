import type {
  SessionNotFoundError,
  InvalidSessionSecretHashError,
  InvalidSessionTokenError,
} from "@/errors/session-errors"
import type { Session, SessionWithToken } from "@/models/session-entities"
import type { Effect, Option } from "effect"
import { Service } from "effect/Context"

export class SessionInputBoundary extends Service<
  SessionInputBoundary,
  {
    createSession: () => Effect.Effect<SessionWithToken>
    validateSession: (
      token: string
    ) => Effect.Effect<
      Option.Option<Session>,
      | SessionNotFoundError
      | InvalidSessionSecretHashError
      | InvalidSessionTokenError
    >
  }
>()("@workspace/auth/application/session/session-input-boundary") {}
