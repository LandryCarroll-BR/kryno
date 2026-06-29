import { Layer } from "effect"

import { BoulderInMemoryRepository } from "./repositories/boulder-in-memory.repository"
import { ClimbingSessionInMemoryRepository } from "./repositories/climbing-session-in-memory.repository"
import { AuthenticatedClimberTest } from "./services/authenticated-climber-test.service"
import { BoulderIdServiceTest } from "./services/boulder-id-test.service"
import { ClimbingAttemptIdServiceTest } from "./services/climbing-attempt-id-test.service"
import { ClimbingSessionIdServiceTest } from "./services/climbing-session-id-test.service"

export const InfrastructureTestLayer = Layer.mergeAll(
  BoulderInMemoryRepository,
  ClimbingSessionInMemoryRepository,
  AuthenticatedClimberTest,
  BoulderIdServiceTest,
  ClimbingAttemptIdServiceTest,
  ClimbingSessionIdServiceTest
)
