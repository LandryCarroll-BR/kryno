import type { SecureRandomString } from "../models/identity.models"
import type { Effect } from "effect"
import { Service } from "effect/Context"

export class IdentityService extends Service<
  IdentityService,
  {
    generateSecureRandomString: () => Effect.Effect<SecureRandomString>
  }
>()("@workspace/auth/application/services/identity-service") {}
