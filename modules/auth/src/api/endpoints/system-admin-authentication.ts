import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiSchema } from "effect/unstable/httpapi"

import {
  SystemAdminInvalidCredentials,
  SystemAdminSessionInvalid,
} from "../../domain/errors.ts"
import {
  CurrentSystemAdminSessionSuccess,
  SystemAdminLoginSuccess,
} from "../../domain/system-admin.ts"
import { PersistenceFailureInternalServerError } from "../persistence-error-response.ts"

export const LoginSystemAdminPayload = Schema.Struct({
  email: Schema.String,
  password: Schema.String,
})

export const SystemAdminInvalidCredentialsUnauthorized =
  SystemAdminInvalidCredentials.pipe(HttpApiSchema.status(401))

export const SystemAdminSessionInvalidUnauthorized =
  SystemAdminSessionInvalid.pipe(HttpApiSchema.status(401))

export const LoginSystemAdminEndpoint = HttpApiEndpoint.post(
  "loginSystemAdmin",
  "/system-admin/sessions",
  {
    payload: LoginSystemAdminPayload,
    success: SystemAdminLoginSuccess,
    error: [
      SystemAdminInvalidCredentialsUnauthorized,
      PersistenceFailureInternalServerError,
    ],
  }
)

export const CurrentSystemAdminSessionEndpoint = HttpApiEndpoint.get(
  "currentSystemAdminSession",
  "/system-admin/session",
  {
    success: CurrentSystemAdminSessionSuccess,
    error: [
      SystemAdminSessionInvalidUnauthorized,
      PersistenceFailureInternalServerError,
    ],
  }
)

export const LogoutSystemAdminEndpoint = HttpApiEndpoint.delete(
  "logoutSystemAdmin",
  "/system-admin/session",
  {
    error: [
      SystemAdminSessionInvalidUnauthorized,
      PersistenceFailureInternalServerError,
    ],
  }
)
