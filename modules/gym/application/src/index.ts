import { Layer } from "effect"

import { CreateGymUseCase } from "./use-cases/create-gym.use-case"

export const ApplicationLayer = Layer.mergeAll(CreateGymUseCase.Live)
