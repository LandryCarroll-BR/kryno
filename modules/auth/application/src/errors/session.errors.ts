import type { SessionId } from "../models/session.models"
import { Data } from "effect"

export class InvalidSessionTokenError extends Data.TaggedError(
  "InvalidSessionTokenError"
) {}

export class SessionNotFoundError extends Data.TaggedError(
  "SessionNotFoundError"
)<{
  readonly sessionId: SessionId
}> {}

export class InvalidSessionSecretHashError extends Data.TaggedError(
  "InvalidSessionSecretHashError"
) {}
