import { Layer } from "effect"

import { GymAreaInMemoryRepository } from "./repositories/gym-area-in-memory.repository"
import { GymMembershipInMemoryRepository } from "./repositories/gym-membership-in-memory.repository"
import { GymRouteInMemoryRepository } from "./repositories/gym-route-in-memory.repository"
import { GymInMemoryRepository } from "./repositories/gym-in-memory.repository"
import { AuthenticatedGymMemberTest } from "./services/authenticated-gym-member-test.service"
import { GymAdministratorAuthorizationTest } from "./services/gym-administrator-authorization-test.service"
import { GymAreaIdServiceTest } from "./services/gym-area-id-test.service"
import { GymBoulderCatalogTest } from "./services/gym-boulder-catalog-test.service"
import { GymIdServiceTest } from "./services/gym-id-test.service"
import { GymRouteIdServiceTest } from "./services/gym-route-id-test.service"

export const InfrastructureTestLayer = Layer.mergeAll(
  AuthenticatedGymMemberTest,
  GymAreaInMemoryRepository,
  GymMembershipInMemoryRepository,
  GymRouteInMemoryRepository,
  GymInMemoryRepository,
  GymAdministratorAuthorizationTest,
  GymAreaIdServiceTest,
  GymBoulderCatalogTest,
  GymIdServiceTest,
  GymRouteIdServiceTest
)
