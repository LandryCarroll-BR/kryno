import { Data } from "effect"

export class UnauthenticatedGymCreatorError extends Data.TaggedError(
  "UnauthenticatedGymCreatorError"
) {}

export class UnauthorizedGymCreatorError extends Data.TaggedError(
  "UnauthorizedGymCreatorError"
) {}
