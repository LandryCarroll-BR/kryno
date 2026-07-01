import { Layer } from "effect"
import { AuthLayer } from "@auth/component"

import { GymDBContextLive } from "./db/context"
import { GymDBRepository } from "./repositories/gym-db.repository"
import { GymCreatorAuthorizationAuth } from "./services/gym-creator-authorization-auth.service"
import { GymIdServiceLive } from "./services/gym-id.service"

const GymInfrastructureLayer = Layer.mergeAll(
  GymDBRepository,
  GymIdServiceLive
).pipe(Layer.provide(GymDBContextLive))

const GymCreatorAuthorizationLayer = GymCreatorAuthorizationAuth.pipe(
  Layer.provide(AuthLayer)
)

export const InfrastructureLayer = Layer.mergeAll(
  GymInfrastructureLayer,
  GymCreatorAuthorizationLayer
)
