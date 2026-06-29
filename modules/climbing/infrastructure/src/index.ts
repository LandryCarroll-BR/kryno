import { Layer } from "effect"
import { AuthLayer } from "@auth/component"

import { ClimbingDBContextLive } from "./db/context"
import { BoulderDBRepository } from "./repositories/boulder-db.repository"
import { ClimbingSessionDBRepository } from "./repositories/climbing-session-db.repository"
import { AuthenticatedClimberAuth } from "./services/authenticated-climber-auth.service"
import { ClimbingAttemptIdServiceLive } from "./services/climbing-attempt-id.service"
import { BoulderIdServiceLive } from "./services/boulder-id.service"
import { ClimbingSessionIdServiceLive } from "./services/climbing-session-id.service"

const ClimbingInfrastructureLayer = Layer.mergeAll(
  BoulderDBRepository,
  BoulderIdServiceLive,
  ClimbingAttemptIdServiceLive,
  ClimbingSessionDBRepository,
  ClimbingSessionIdServiceLive
).pipe(Layer.provide(ClimbingDBContextLive))

const AuthenticatedClimberLayer = AuthenticatedClimberAuth.pipe(
  Layer.provide(AuthLayer)
)

export const InfrastructureLayer = Layer.mergeAll(
  ClimbingInfrastructureLayer,
  AuthenticatedClimberLayer
)
