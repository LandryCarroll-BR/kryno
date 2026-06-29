import { Layer } from "effect"

import { CreateBoulderUseCase } from "./use-cases/create-boulder.use-case"
import { EndClimbingSessionUseCase } from "./use-cases/end-climbing-session.use-case"
import { GetCurrentClimbingSessionUseCase } from "./use-cases/get-current-climbing-session.use-case"
import { ListCreatedBouldersUseCase } from "./use-cases/list-created-boulders.use-case"
import { LogBoulderAttemptUseCase } from "./use-cases/log-boulder-attempt.use-case"
import { StartClimbingSessionUseCase } from "./use-cases/start-climbing-session.use-case"

export const ApplicationLayer = Layer.mergeAll(
  CreateBoulderUseCase.Live,
  EndClimbingSessionUseCase.Live,
  GetCurrentClimbingSessionUseCase.Live,
  ListCreatedBouldersUseCase.Live,
  LogBoulderAttemptUseCase.Live,
  StartClimbingSessionUseCase.Live
)
