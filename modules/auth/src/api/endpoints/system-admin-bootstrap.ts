import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiSchema } from "effect/unstable/httpapi"

import { FirstSystemAdminAlreadyExists } from "../../domain/errors.ts"
import { BootstrapFirstSystemAdminSuccess } from "../../domain/system-admin.ts"
import { PersistenceFailureInternalServerError } from "../persistence-error-response.ts"

export const BootstrapFirstSystemAdminPayload = Schema.Struct({
  email: Schema.String,
  password: Schema.String,
})

export const FirstSystemAdminAlreadyExistsConflict =
  FirstSystemAdminAlreadyExists.pipe(HttpApiSchema.status(409))

export const BootstrapFirstSystemAdminEndpoint = HttpApiEndpoint.post(
  "bootstrapFirstSystemAdmin",
  "/system-admin/bootstrap",
  {
    payload: BootstrapFirstSystemAdminPayload,
    success: BootstrapFirstSystemAdminSuccess,
    error: [
      FirstSystemAdminAlreadyExistsConflict,
      PersistenceFailureInternalServerError,
    ],
  }
)
