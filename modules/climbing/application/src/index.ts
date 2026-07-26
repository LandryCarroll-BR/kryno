import { Layer } from "effect"

import { ClimbingAttemptRecorder } from "./factories/climbing-attempt-recorder.factory"
import { CreateBoulderUseCase } from "./use-cases/create-boulder.use-case"
import { DeleteBoulderUseCase } from "./use-cases/delete-boulder.use-case"
import { DeleteClimbingSessionUseCase } from "./use-cases/delete-climbing-session.use-case"
import { EndClimbingSessionUseCase } from "./use-cases/end-climbing-session.use-case"
import { GetBouldersByIdsUseCase } from "./use-cases/get-boulders-by-ids.use-case"
import { GetCurrentClimbingSessionUseCase } from "./use-cases/get-current-climbing-session.use-case"
import { ListCreatedBouldersUseCase } from "./use-cases/list-created-boulders.use-case"
import { LogBoulderAttemptUseCase } from "./use-cases/log-boulder-attempt.use-case"
import { LogExistingBoulderAttemptUseCase } from "./use-cases/log-existing-boulder-attempt.use-case"
import { StartClimbingSessionUseCase } from "./use-cases/start-climbing-session.use-case"

const UseCaseLayer = Layer.mergeAll(
  CreateBoulderUseCase.Live,
  DeleteBoulderUseCase.Live,
  DeleteClimbingSessionUseCase.Live,
  EndClimbingSessionUseCase.Live,
  GetBouldersByIdsUseCase.Live,
  GetCurrentClimbingSessionUseCase.Live,
  ListCreatedBouldersUseCase.Live,
  LogBoulderAttemptUseCase.Live,
  LogExistingBoulderAttemptUseCase.Live,
  StartClimbingSessionUseCase.Live
)

export const ApplicationLayer = UseCaseLayer.pipe(
  Layer.provideMerge(ClimbingAttemptRecorder.Live)
)
