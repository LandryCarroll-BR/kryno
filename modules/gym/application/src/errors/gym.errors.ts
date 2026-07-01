import { Data } from "effect"

export class UnauthenticatedGymAdministratorError extends Data.TaggedError(
  "UnauthenticatedGymAdministratorError"
) {}

export class UnauthorizedGymAdministratorError extends Data.TaggedError(
  "UnauthorizedGymAdministratorError"
) {}
