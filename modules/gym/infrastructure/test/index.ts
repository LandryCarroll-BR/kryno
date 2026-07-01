import { Layer } from "effect"

import { GymMembershipInMemoryRepository } from "./repositories/gym-membership-in-memory.repository"
import { GymInMemoryRepository } from "./repositories/gym-in-memory.repository"
import { AuthenticatedGymMemberTest } from "./services/authenticated-gym-member-test.service"
import { GymCreatorAuthorizationTest } from "./services/gym-creator-authorization-test.service"
import { GymIdServiceTest } from "./services/gym-id-test.service"

export const InfrastructureTestLayer = Layer.mergeAll(
  AuthenticatedGymMemberTest,
  GymMembershipInMemoryRepository,
  GymInMemoryRepository,
  GymCreatorAuthorizationTest,
  GymIdServiceTest
)
