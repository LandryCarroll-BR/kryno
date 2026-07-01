import { Layer } from "effect"
import { AuthLayer } from "@auth/component"

import { GymDBContextLive } from "./db/context"
import { GymMembershipDBRepository } from "./repositories/gym-membership-db.repository"
import { GymDBRepository } from "./repositories/gym-db.repository"
import { AuthenticatedGymMemberAuth } from "./services/authenticated-gym-member-auth.service"
import { GymCreatorAuthorizationAuth } from "./services/gym-creator-authorization-auth.service"
import { GymIdServiceLive } from "./services/gym-id.service"

const GymInfrastructureLayer = Layer.mergeAll(
  GymDBRepository,
  GymMembershipDBRepository,
  GymIdServiceLive
).pipe(Layer.provide(GymDBContextLive))

const GymAuthenticationLayer = Layer.mergeAll(
  GymCreatorAuthorizationAuth,
  AuthenticatedGymMemberAuth
).pipe(Layer.provide(AuthLayer))

export const InfrastructureLayer = Layer.mergeAll(
  GymInfrastructureLayer,
  GymAuthenticationLayer
)
