import { Effect } from "effect"
import * as Context from "effect/Context"
import type { PersistenceError } from "@workspace/drizzle"

import type {
  GymAccessInactive,
  GymOwnerAccessDenied,
  GymStaffInvitationInvalid,
  GymStaffSelfAssignmentDenied,
  GymUserSessionInvalid,
  GymUserUnverified,
} from "../../domain/errors.ts"
import type {
  AcceptGymStaffInvitationInput,
  CreateGymStaffInvitationInput,
  GymStaffInvitationAccepted,
  GymStaffInvitationCreated,
} from "../../domain/gym.ts"

export class GymStaffInvitation extends Context.Service<
  GymStaffInvitation,
  {
    readonly create: (
      input: CreateGymStaffInvitationInput
    ) => Effect.Effect<
      GymStaffInvitationCreated,
      | GymUserSessionInvalid
      | GymUserUnverified
      | GymAccessInactive
      | GymOwnerAccessDenied
      | GymStaffSelfAssignmentDenied
      | PersistenceError
    >
    readonly accept: (
      input: AcceptGymStaffInvitationInput
    ) => Effect.Effect<
      GymStaffInvitationAccepted,
      | GymUserSessionInvalid
      | GymUserUnverified
      | GymAccessInactive
      | GymStaffInvitationInvalid
      | GymStaffSelfAssignmentDenied
      | PersistenceError
    >
  }
>()("@kryno/auth/GymStaffInvitation") {}
