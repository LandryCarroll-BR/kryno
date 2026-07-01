import { Data } from "effect"
import type { BoulderId } from "@climbing/application/models/boulder"

import type { GymAreaId } from "../models/gym-area.models"
import type { GymRouteOrder } from "../models/gym-route.models"

export class GymRouteOrderAlreadyExistsError extends Data.TaggedError(
  "GymRouteOrderAlreadyExistsError"
)<{
  readonly areaId: GymAreaId
  readonly order: GymRouteOrder
}> {}

export class GymRouteBoulderNotAssignableError extends Data.TaggedError(
  "GymRouteBoulderNotAssignableError"
)<{
  readonly boulderId: BoulderId
}> {}
