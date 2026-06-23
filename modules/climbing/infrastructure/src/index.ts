import { Layer } from "effect"
import { AuthLayer } from "@auth/component"

import { ClimbingDBContextLive } from "./db/context"
import { ClimbingSessionDBRepository } from "./repositories/climbing-session-db.repository"
import { AuthenticatedClimberAuth } from "./services/authenticated-climber-auth.service"
import { ClimbingSessionIdServiceLive } from "./services/climbing-session-id.service"

export { ClimbingDB, ClimbingDBContextLive } from "./db/context"

const ClimbingInfrastructureLayer = Layer.mergeAll(
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
