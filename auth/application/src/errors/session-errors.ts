import { SessionId } from "@/domain/session-value-objects"
import { Schema } from "effect"

export class InvalidSessionTokenError extends Schema.ErrorClass<InvalidSessionTokenError>(
  "InvalidSessionTokenError"
)({}) {}

export class SessionNotFoundError extends Schema.ErrorClass<SessionNotFoundError>(
  "SessionNotFoundError"
)({
  sessionId: SessionId,
}) {}

export class InvalidSessionSecretHashError extends Schema.ErrorClass<InvalidSessionSecretHashError>(
  "InvalidSessionSecretHashError"
)({}) {}
