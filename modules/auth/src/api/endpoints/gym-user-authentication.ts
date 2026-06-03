import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiSchema } from "effect/unstable/httpapi"

import {
  GymUserInvalidCredentials,
  GymUserSessionInvalid,
  GymUserUnverified,
} from "../../domain/errors.ts"
import {
  CurrentGymUserSessionSuccess,
  GymUserLoginSuccess,
} from "../../domain/gym-user.ts"
import { PersistenceFailureInternalServerError } from "../persistence-error-response.ts"

export const LoginGymUserPayload = Schema.Struct({
  email: Schema.String,
  password: Schema.String,
})

export const GymUserInvalidCredentialsUnauthorized =
  GymUserInvalidCredentials.pipe(HttpApiSchema.status(401))

export const GymUserUnverifiedForbidden = GymUserUnverified.pipe(
  HttpApiSchema.status(403)
)

export const GymUserSessionInvalidUnauthorized = GymUserSessionInvalid.pipe(
  HttpApiSchema.status(401)
)

export const LoginGymUserEndpoint = HttpApiEndpoint.post(
  "loginGymUser",
  "/gym-users/sessions",
  {
    payload: LoginGymUserPayload,
    success: GymUserLoginSuccess,
    error: [
      GymUserInvalidCredentialsUnauthorized,
      GymUserUnverifiedForbidden,
      PersistenceFailureInternalServerError,
    ],
  }
)

export const CurrentGymUserSessionEndpoint = HttpApiEndpoint.get(
  "currentGymUserSession",
  "/gym-users/session",
  {
    success: CurrentGymUserSessionSuccess,
    error: [
      GymUserSessionInvalidUnauthorized,
      GymUserUnverifiedForbidden,
      PersistenceFailureInternalServerError,
    ],
  }
)

export const LogoutGymUserEndpoint = HttpApiEndpoint.delete(
  "logoutGymUser",
  "/gym-users/session",
  {
    error: [
      GymUserSessionInvalidUnauthorized,
      PersistenceFailureInternalServerError,
    ],
  }
)
