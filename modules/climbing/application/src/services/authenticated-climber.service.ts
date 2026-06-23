import type { Effect } from "effect"
import { Service } from "effect/Context"

import type { UnauthenticatedClimberError } from "../errors/climber.errors"
import type { ClimberId } from "../models/climber.models"

export class AuthenticatedClimber extends Service<
  AuthenticatedClimber,
  {
    readonly resolve: (
      token: string
    ) => Effect.Effect<ClimberId, UnauthenticatedClimberError>
  }
>()("@climbing/application/AuthenticatedClimber") {}
