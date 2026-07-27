import { Layer } from "effect"
import { AuthLayer } from "@auth/component"
import { ClimbingLayer } from "@climbing/component"

import { GymDBContextLive } from "./db/context"
import { GymAreaDBRepository } from "./repositories/gym-area-db.repository"
import { GymMembershipDBRepository } from "./repositories/gym-membership-db.repository"
import { GymRouteDBRepository } from "./repositories/gym-route-db.repository"
import { GymDBRepository } from "./repositories/gym-db.repository"
import { AuthenticatedGymMemberAuth } from "./services/authenticated-gym-member-auth.service"
import { GymAdministratorAuthorizationAuth } from "./services/gym-administrator-authorization-auth.service"
import { GymAreaIdServiceLive } from "./services/gym-area-id.service"
import { GymBoulderCatalogClimbing } from "./services/gym-boulder-catalog-climbing.service"
import { GymBoulderAttemptsClimbing } from "./services/gym-boulder-attempts-climbing.service"
import { GymIdServiceLive } from "./services/gym-id.service"
import { GymRouteImageStorageLocal } from "./services/gym-route-image-storage-local.service"
import { GymRouteIdServiceLive } from "./services/gym-route-id.service"

const GymInfrastructureLayer = Layer.mergeAll(
  GymDBRepository,
  GymAreaDBRepository,
  GymMembershipDBRepository,
  GymRouteDBRepository,
  GymAreaIdServiceLive,
  GymRouteIdServiceLive,
  GymIdServiceLive,
  GymRouteImageStorageLocal
).pipe(Layer.provide(GymDBContextLive))

const GymAuthenticationLayer = Layer.mergeAll(
  GymAdministratorAuthorizationAuth,
  AuthenticatedGymMemberAuth
).pipe(Layer.provide(AuthLayer))

export const InfrastructureLayer = Layer.mergeAll(
  GymInfrastructureLayer,
  GymAuthenticationLayer,
  Layer.mergeAll(
    GymBoulderCatalogClimbing,
    GymBoulderAttemptsClimbing
  ).pipe(Layer.provide(ClimbingLayer))
)
