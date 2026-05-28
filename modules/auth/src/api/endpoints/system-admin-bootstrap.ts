import { HttpApiEndpoint, HttpApiSchema } from "effect/unstable/httpapi"

import { FirstSystemAdminAlreadyExists } from "../../domain/errors.ts"
import {
  BootstrapFirstSystemAdminInput,
  BootstrapFirstSystemAdminSuccess,
} from "../../domain/system-admin.ts"

export const FirstSystemAdminAlreadyExistsConflict =
  FirstSystemAdminAlreadyExists.pipe(HttpApiSchema.status(409))

export const BootstrapFirstSystemAdminEndpoint = HttpApiEndpoint.post(
  "bootstrapFirstSystemAdmin",
  "/system-admin/bootstrap",
  {
    payload: BootstrapFirstSystemAdminInput,
    success: BootstrapFirstSystemAdminSuccess,
    error: FirstSystemAdminAlreadyExistsConflict,
  }
)
