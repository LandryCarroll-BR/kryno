import { Layer } from "effect"

import { StartClimbingSessionUseCase } from "./use-cases/start-climbing-session.use-case"

export * from "./errors/climber.errors"

export * from "./models/boulder.models"
export * from "./models/climber.models"
export * from "./models/climbing-attempt.models"
export * from "./models/climbing-moves.models"
export * from "./models/climbing-session.models"

export * from "./repositories/climbing-session.repository"

export * from "./services/authenticated-climber.service"
export * from "./services/climbing-session-id.service"

export * from "./use-cases/start-climbing-session.use-case"

export const ApplicationLayer = Layer.mergeAll(
  StartClimbingSessionUseCase.Live
)
