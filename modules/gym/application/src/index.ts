import { Layer } from "effect"

import { CreateGymUseCase } from "./use-cases/create-gym.use-case"
import { JoinGymUseCase } from "./use-cases/join-gym.use-case"
import { ListGymsUseCase } from "./use-cases/list-gyms.use-case"

export const ApplicationLayer = Layer.mergeAll(
  CreateGymUseCase.Live,
  JoinGymUseCase.Live,
  ListGymsUseCase.Live
)
