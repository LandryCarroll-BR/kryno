import { Layer } from "effect"
import { AuthLayer } from "@auth/component"

import { ClimbingDBContextLive } from "./db/context"
import { BoulderDBRepository } from "./repositories/boulder-db.repository"
import { ClimbingSessionDBRepository } from "./repositories/climbing-session-db.repository"
import { AuthenticatedClimberAuth } from "./services/authenticated-climber-auth.service"
import { BoulderIdServiceLive } from "./services/boulder-id.service"
import { ClimbingSessionIdServiceLive } from "./services/climbing-session-id.service"

export { ClimbingDB, ClimbingDBContextLive } from "./db/context"

const ClimbingInfrastructureLayer = Layer.mergeAll(
  BoulderDBRepository,
  BoulderIdServiceLive,
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
