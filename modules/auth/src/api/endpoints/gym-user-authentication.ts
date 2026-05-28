import { HttpApiEndpoint, HttpApiSchema } from "effect/unstable/httpapi"

import {
  GymUserInvalidCredentials,
  GymUserSessionInvalid,
  GymUserUnverified,
} from "../../domain/errors.ts"
import {
  CurrentGymUserSessionSuccess,
  GymUserLoginSuccess,
  GymUserSessionId,
  LoginGymUserInput,
} from "../../domain/gym-user.ts"

export const GymUserInvalidCredentialsUnauthorized =
  GymUserInvalidCredentials.pipe(HttpApiSchema.status(401))

export const GymUserUnverifiedForbidden = GymUserUnverified.pipe(
  HttpApiSchema.status(403)
)

export const GymUserSessionInvalidUnauthorized =
  GymUserSessionInvalid.pipe(HttpApiSchema.status(401))

export const LoginGymUserEndpoint = HttpApiEndpoint.post(
  "loginGymUser",
  "/gym-users/sessions",
  {
    payload: LoginGymUserInput,
    success: GymUserLoginSuccess,
    error: [
      GymUserInvalidCredentialsUnauthorized,
      GymUserUnverifiedForbidden,
    ],
  }
)

export const CurrentGymUserSessionEndpoint = HttpApiEndpoint.get(
  "currentGymUserSession",
  "/gym-users/sessions/:sessionId",
  {
    params: { sessionId: GymUserSessionId },
    success: CurrentGymUserSessionSuccess,
    error: [GymUserSessionInvalidUnauthorized, GymUserUnverifiedForbidden],
  }
)

export const LogoutGymUserEndpoint = HttpApiEndpoint.delete(
  "logoutGymUser",
  "/gym-users/sessions/:sessionId",
  {
    params: { sessionId: GymUserSessionId },
    error: GymUserSessionInvalidUnauthorized,
  }
)
