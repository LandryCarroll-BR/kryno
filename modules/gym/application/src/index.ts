import { Layer } from "effect"

import { CreateGymUseCase } from "./use-cases/create-gym.use-case"
import { CreateGymAreaUseCase } from "./use-cases/create-gym-area.use-case"
import { CreateGymRouteUseCase } from "./use-cases/create-gym-route.use-case"
import { GetGymManagementUseCase } from "./use-cases/get-gym-management.use-case"
import { JoinGymUseCase } from "./use-cases/join-gym.use-case"
import { ListGymsUseCase } from "./use-cases/list-gyms.use-case"

export const ApplicationLayer = Layer.mergeAll(
  CreateGymUseCase.Live,
  CreateGymAreaUseCase.Live,
  CreateGymRouteUseCase.Live,
  GetGymManagementUseCase.Live,
  JoinGymUseCase.Live,
  ListGymsUseCase.Live
)
