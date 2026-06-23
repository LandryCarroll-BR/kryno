import { Layer } from "effect"

import { CreateBoulderUseCase } from "./use-cases/create-boulder.use-case"
import { EndClimbingSessionUseCase } from "./use-cases/end-climbing-session.use-case"
import { GetCurrentClimbingSessionUseCase } from "./use-cases/get-current-climbing-session.use-case"
import { ListCreatedBouldersUseCase } from "./use-cases/list-created-boulders.use-case"
import { StartClimbingSessionUseCase } from "./use-cases/start-climbing-session.use-case"

export * from "./errors/climber.errors"
export * from "./errors/climbing-session.errors"

export * from "./models/boulder.models"
export * from "./models/climber.models"
export * from "./models/climbing-attempt.models"
export * from "./models/climbing-moves.models"
export * from "./models/climbing-session.models"

export * from "./repositories/boulder.repository"
export * from "./repositories/climbing-session.repository"

export * from "./services/authenticated-climber.service"
export * from "./services/boulder-id.service"
export * from "./services/climbing-session-id.service"

export * from "./use-cases/create-boulder.use-case"
export * from "./use-cases/end-climbing-session.use-case"
export * from "./use-cases/get-current-climbing-session.use-case"
export * from "./use-cases/list-created-boulders.use-case"
export * from "./use-cases/start-climbing-session.use-case"

export const ApplicationLayer = Layer.mergeAll(
  CreateBoulderUseCase.Live,
  EndClimbingSessionUseCase.Live,
  GetCurrentClimbingSessionUseCase.Live,
  ListCreatedBouldersUseCase.Live,
  StartClimbingSessionUseCase.Live
)
