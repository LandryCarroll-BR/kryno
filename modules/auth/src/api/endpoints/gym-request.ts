import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiSchema } from "effect/unstable/httpapi"

import {
  GymAccessInactive,
  GymCreationRequestInvalid,
  GymMemberAffiliationInvalid,
  GymOwnerAccessDenied,
  GymUserSessionInvalid,
  GymUserUnverified,
  SystemAdminSessionInvalid,
} from "../../domain/errors.ts"
import {
  CurrentGymOwnerAccessInput,
  CurrentGymOwnerAccessSuccess,
  GymCreationRequestId,
  GymCreationRequestApproved,
  GymCreationRequested,
  GymMemberJoined,
  GymMemberLeft,
  JoinGymAsMemberInput,
  LeaveGymAsMemberInput,
} from "../../domain/gym.ts"

export class RequestGymCreationPayload extends Schema.Class<RequestGymCreationPayload>(
  "RequestGymCreationPayload"
)({
  name: Schema.String,
}) {}

export class ApproveGymCreationRequestPayload extends Schema.Class<ApproveGymCreationRequestPayload>(
  "ApproveGymCreationRequestPayload"
)({
  requestId: GymCreationRequestId,
}) {}

export const GymCreationRequestedCreated = GymCreationRequested.pipe(
  HttpApiSchema.status(201)
)

export const GymCreationRequestInvalidBadRequest =
  GymCreationRequestInvalid.pipe(HttpApiSchema.status(400))

export const GymAccessInactiveForbidden = GymAccessInactive.pipe(
  HttpApiSchema.status(403)
)

export const GymOwnerAccessDeniedForbidden = GymOwnerAccessDenied.pipe(
  HttpApiSchema.status(403)
)

export const GymMemberAffiliationInvalidConflict =
  GymMemberAffiliationInvalid.pipe(HttpApiSchema.status(409))

const GymUserSessionInvalidUnauthorized = GymUserSessionInvalid.pipe(
  HttpApiSchema.status(401)
)

const GymUserUnverifiedForbidden = GymUserUnverified.pipe(
  HttpApiSchema.status(403)
)

const SystemAdminSessionInvalidUnauthorized = SystemAdminSessionInvalid.pipe(
  HttpApiSchema.status(401)
)

export const RequestGymCreationEndpoint = HttpApiEndpoint.post(
  "requestGymCreation",
  "/gyms/requests",
  {
    payload: RequestGymCreationPayload,
    success: GymCreationRequestedCreated,
    error: [GymUserSessionInvalidUnauthorized, GymUserUnverifiedForbidden],
  }
)

export const ApproveGymCreationRequestEndpoint = HttpApiEndpoint.post(
  "approveGymCreationRequest",
  "/gyms/requests/approvals",
  {
    payload: ApproveGymCreationRequestPayload,
    success: GymCreationRequestApproved,
    error: [
      SystemAdminSessionInvalidUnauthorized,
      GymCreationRequestInvalidBadRequest,
    ],
  }
)

export const CurrentGymOwnerAccessEndpoint = HttpApiEndpoint.post(
  "currentGymOwnerAccess",
  "/gyms/owner-access",
  {
    payload: CurrentGymOwnerAccessInput,
    success: CurrentGymOwnerAccessSuccess,
    error: [
      GymUserSessionInvalidUnauthorized,
      GymUserUnverifiedForbidden,
      GymAccessInactiveForbidden,
      GymOwnerAccessDeniedForbidden,
    ],
  }
)

export const JoinGymAsMemberEndpoint = HttpApiEndpoint.post(
  "joinGymAsMember",
  "/gyms/member-affiliations",
  {
    payload: JoinGymAsMemberInput,
    success: GymMemberJoined,
    error: [
      GymUserSessionInvalidUnauthorized,
      GymUserUnverifiedForbidden,
      GymAccessInactiveForbidden,
      GymMemberAffiliationInvalidConflict,
    ],
  }
)

export const LeaveGymAsMemberEndpoint = HttpApiEndpoint.post(
  "leaveGymAsMember",
  "/gyms/member-affiliations/leaves",
  {
    payload: LeaveGymAsMemberInput,
    success: GymMemberLeft,
    error: [
      GymUserSessionInvalidUnauthorized,
      GymUserUnverifiedForbidden,
      GymAccessInactiveForbidden,
      GymMemberAffiliationInvalidConflict,
    ],
  }
)
