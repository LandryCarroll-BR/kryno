import { Data } from "effect"

import type { GymAreaId, GymAreaName } from "../models/gym-area.models"
import type { GymId } from "../models/gym.models"

export class GymAreaNotFoundError extends Data.TaggedError(
  "GymAreaNotFoundError"
)<{
  readonly gymId: GymId
  readonly areaId: GymAreaId
}> {}

export class GymAreaNameAlreadyExistsError extends Data.TaggedError(
  "GymAreaNameAlreadyExistsError"
)<{
  readonly gymId: GymId
  readonly name: GymAreaName
}> {}
