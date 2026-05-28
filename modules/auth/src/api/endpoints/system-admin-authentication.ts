import { HttpApiEndpoint, HttpApiSchema } from "effect/unstable/httpapi"

import {
  SystemAdminInvalidCredentials,
  SystemAdminSessionInvalid,
} from "../../domain/errors.ts"
import {
  CurrentSystemAdminSessionSuccess,
  LoginSystemAdminInput,
  SystemAdminLoginSuccess,
  SystemAdminSessionId,
} from "../../domain/system-admin.ts"

export const SystemAdminInvalidCredentialsUnauthorized =
  SystemAdminInvalidCredentials.pipe(HttpApiSchema.status(401))

export const SystemAdminSessionInvalidUnauthorized =
  SystemAdminSessionInvalid.pipe(HttpApiSchema.status(401))

export const LoginSystemAdminEndpoint = HttpApiEndpoint.post(
  "loginSystemAdmin",
  "/system-admin/sessions",
  {
    payload: LoginSystemAdminInput,
    success: SystemAdminLoginSuccess,
    error: SystemAdminInvalidCredentialsUnauthorized,
  }
)

export const CurrentSystemAdminSessionEndpoint = HttpApiEndpoint.get(
  "currentSystemAdminSession",
  "/system-admin/sessions/:sessionId",
  {
    params: { sessionId: SystemAdminSessionId },
    success: CurrentSystemAdminSessionSuccess,
    error: SystemAdminSessionInvalidUnauthorized,
  }
)

export const LogoutSystemAdminEndpoint = HttpApiEndpoint.delete(
  "logoutSystemAdmin",
  "/system-admin/sessions/:sessionId",
  {
    params: { sessionId: SystemAdminSessionId },
    error: SystemAdminSessionInvalidUnauthorized,
  }
)
