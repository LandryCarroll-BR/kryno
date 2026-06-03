import { Effect } from "effect"
import * as Context from "effect/Context"
import type { PersistenceError } from "@workspace/drizzle"

import {
  type GymAccessInactive,
  type GymCreationRequestInvalid,
  type GymMemberAffiliationInvalid,
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
  type GymMemberJoined,
  type GymMemberLeft,
  type JoinGymAsMemberInput,
  type LeaveGymAsMemberInput,
  type RequestGymCreationInput,
} from "../../domain/gym.ts"

export class GymRequest extends Context.Service<
  GymRequest,
  {
    readonly requestCreation: (
      input: RequestGymCreationInput
    ) => Effect.Effect<
      GymCreationRequested,
      GymUserSessionInvalid | GymUserUnverified | PersistenceError
    >
    readonly approveCreationRequest: (
      input: ApproveGymCreationRequestInput
    ) => Effect.Effect<
      GymCreationRequestApproved,
      SystemAdminSessionInvalid | GymCreationRequestInvalid | PersistenceError
    >
    readonly currentOwnerAccess: (
      input: CurrentGymOwnerAccessInput
    ) => Effect.Effect<
      CurrentGymOwnerAccessSuccess,
      | GymUserSessionInvalid
      | GymUserUnverified
      | GymAccessInactive
      | GymOwnerAccessDenied
      | PersistenceError
    >
    readonly joinAsMember: (
      input: JoinGymAsMemberInput
    ) => Effect.Effect<
      GymMemberJoined,
      | GymUserSessionInvalid
      | GymUserUnverified
      | GymAccessInactive
      | GymMemberAffiliationInvalid
      | PersistenceError
    >
    readonly leaveAsMember: (
      input: LeaveGymAsMemberInput
    ) => Effect.Effect<
      GymMemberLeft,
      | GymUserSessionInvalid
      | GymUserUnverified
      | GymAccessInactive
      | GymMemberAffiliationInvalid
      | PersistenceError
    >
  }
>()("@kryno/auth/GymRequest") {}
