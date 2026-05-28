import { Effect } from "effect"
import * as Context from "effect/Context"

import {
  type GymAccessInactive,
  type GymCreationRequestInvalid,
  type GymOwnerAccessDenied,
  type GymUserSessionInvalid,
  type GymUserUnverified,
  type SystemAdminSessionInvalid,
} from "../../domain/errors.ts"
import {
  type ApproveGymCreationRequestInput,
  type CurrentGymOwnerAccessInput,
  type CurrentGymOwnerAccessSuccess,
  type GymCreationRequestApproved,
  type GymCreationRequested,
  type RequestGymCreationInput,
} from "../../domain/gym.ts"

export class GymRequest extends Context.Service<
  GymRequest,
  {
    readonly requestCreation: (
      input: RequestGymCreationInput
    ) => Effect.Effect<
      GymCreationRequested,
      GymUserSessionInvalid | GymUserUnverified
    >
    readonly approveCreationRequest: (
      input: ApproveGymCreationRequestInput
    ) => Effect.Effect<
      GymCreationRequestApproved,
      SystemAdminSessionInvalid | GymCreationRequestInvalid
    >
    readonly currentOwnerAccess: (
      input: CurrentGymOwnerAccessInput
    ) => Effect.Effect<
      CurrentGymOwnerAccessSuccess,
      | GymUserSessionInvalid
      | GymUserUnverified
      | GymAccessInactive
      | GymOwnerAccessDenied
    >
  }
>()("@kryno/auth/GymRequest") {}
