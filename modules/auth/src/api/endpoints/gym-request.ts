import { HttpApiEndpoint, HttpApiSchema } from "effect/unstable/httpapi"

import {
  GymAccessInactive,
  GymCreationRequestInvalid,
  GymOwnerAccessDenied,
  GymUserSessionInvalid,
  GymUserUnverified,
  SystemAdminSessionInvalid,
} from "../../domain/errors.ts"
import {
  ApproveGymCreationRequestInput,
  CurrentGymOwnerAccessInput,
  CurrentGymOwnerAccessSuccess,
  GymCreationRequestApproved,
  GymCreationRequested,
  RequestGymCreationInput,
} from "../../domain/gym.ts"

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
    payload: RequestGymCreationInput,
    success: GymCreationRequestedCreated,
    error: [GymUserSessionInvalidUnauthorized, GymUserUnverifiedForbidden],
  }
)

export const ApproveGymCreationRequestEndpoint = HttpApiEndpoint.post(
  "approveGymCreationRequest",
  "/gyms/requests/approvals",
  {
    payload: ApproveGymCreationRequestInput,
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
