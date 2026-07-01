import { Layer } from "effect"

import { GymInMemoryRepository } from "./repositories/gym-in-memory.repository"
import { GymCreatorAuthorizationTest } from "./services/gym-creator-authorization-test.service"
import { GymIdServiceTest } from "./services/gym-id-test.service"

export const InfrastructureTestLayer = Layer.mergeAll(
  GymInMemoryRepository,
  GymCreatorAuthorizationTest,
  GymIdServiceTest
)
