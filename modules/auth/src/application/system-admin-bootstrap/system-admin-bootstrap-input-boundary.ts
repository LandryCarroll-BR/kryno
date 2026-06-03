import { Effect } from "effect"
import * as Context from "effect/Context"
import type { PersistenceError } from "@workspace/drizzle"

import { type FirstSystemAdminAlreadyExists } from "../../domain/errors.ts"
import {
  type BootstrapFirstSystemAdminInput,
  type BootstrapFirstSystemAdminSuccess,
} from "../../domain/system-admin.ts"

export class SystemAdminBootstrap extends Context.Service<
  SystemAdminBootstrap,
  {
    readonly bootstrapFirstAdmin: (
      input: BootstrapFirstSystemAdminInput
    ) => Effect.Effect<
      BootstrapFirstSystemAdminSuccess,
      FirstSystemAdminAlreadyExists | PersistenceError
    >
  }
>()("@kryno/auth/SystemAdminBootstrap") {}
