import { Data } from "effect"

export class UnauthenticatedClimberError extends Data.TaggedError(
  "UnauthenticatedClimberError"
) {}
