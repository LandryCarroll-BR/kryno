import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiSchema } from "effect/unstable/httpapi"

import {
  GymAccessInactive,
  GymOwnerAccessDenied,
  GymStaffInvitationInvalid,
  GymStaffSelfAssignmentDenied,
  GymUserSessionInvalid,
  GymUserUnverified,
} from "../../domain/errors.ts"
import {
  GymId,
  GymStaffInvitationAccepted,
  GymStaffInvitationCreated,
} from "../../domain/gym.ts"

export class CreateGymStaffInvitationPayload extends Schema.Class<CreateGymStaffInvitationPayload>(
  "CreateGymStaffInvitationPayload"
)({
  gymId: GymId,
  email: Schema.String,
}) {}

export class AcceptGymStaffInvitationPayload extends Schema.Class<AcceptGymStaffInvitationPayload>(
  "AcceptGymStaffInvitationPayload"
)({
  token: Schema.String,
}) {}

export const GymStaffInvitationCreatedCreated =
  GymStaffInvitationCreated.pipe(HttpApiSchema.status(201))

const GymUserSessionInvalidUnauthorized = GymUserSessionInvalid.pipe(
  HttpApiSchema.status(401)
)

const GymUserUnverifiedForbidden = GymUserUnverified.pipe(
  HttpApiSchema.status(403)
)

const GymAccessInactiveForbidden = GymAccessInactive.pipe(
  HttpApiSchema.status(403)
)

const GymOwnerAccessDeniedForbidden = GymOwnerAccessDenied.pipe(
  HttpApiSchema.status(403)
)

const GymStaffSelfAssignmentDeniedForbidden =
  GymStaffSelfAssignmentDenied.pipe(HttpApiSchema.status(403))

const GymStaffInvitationInvalidBadRequest = GymStaffInvitationInvalid.pipe(
  HttpApiSchema.status(400)
)

export const CreateGymStaffInvitationEndpoint = HttpApiEndpoint.post(
  "createGymStaffInvitation",
  "/gyms/staff-invitations",
  {
    payload: CreateGymStaffInvitationPayload,
    success: GymStaffInvitationCreatedCreated,
    error: [
      GymUserSessionInvalidUnauthorized,
      GymUserUnverifiedForbidden,
      GymAccessInactiveForbidden,
      GymOwnerAccessDeniedForbidden,
      GymStaffSelfAssignmentDeniedForbidden,
    ],
  }
)

export const AcceptGymStaffInvitationEndpoint = HttpApiEndpoint.post(
  "acceptGymStaffInvitation",
  "/gyms/staff-invitations/acceptances",
  {
    payload: AcceptGymStaffInvitationPayload,
    success: GymStaffInvitationAccepted,
    error: [
      GymUserSessionInvalidUnauthorized,
      GymUserUnverifiedForbidden,
      GymAccessInactiveForbidden,
      GymStaffInvitationInvalidBadRequest,
      GymStaffSelfAssignmentDeniedForbidden,
    ],
  }
)
