export {}
import { Layer } from "effect"

import { ClimbingSessionInMemoryRepository } from "./repositories/climbing-session-in-memory.repository"
import { AuthenticatedClimberTest } from "./services/authenticated-climber-test.service"
import { ClimbingSessionIdServiceTest } from "./services/climbing-session-id-test.service"

export const InfrastructureTestLayer = Layer.mergeAll(
  ClimbingSessionInMemoryRepository,
  AuthenticatedClimberTest,
  ClimbingSessionIdServiceTest
)
