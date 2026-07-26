import { Data } from "effect"
import type { BoulderId } from "@climbing/application/models/boulder"

import type { GymAreaId } from "../models/gym-area.models"
import type {
  GymRouteId,
  GymRouteOrder,
} from "../models/gym-route.models"
import type { GymId } from "../models/gym.models"

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

export class GymRouteBoulderAlreadyAssignedError extends Data.TaggedError(
  "GymRouteBoulderAlreadyAssignedError"
)<{
  readonly boulderId: BoulderId
}> {}

export class GymRouteNotFoundError extends Data.TaggedError(
  "GymRouteNotFoundError"
)<{
  readonly gymId: GymId
  readonly routeId: GymRouteId
}> {}

export class GymRouteBoulderUnavailableError extends Data.TaggedError(
  "GymRouteBoulderUnavailableError"
)<{
  readonly routeId: GymRouteId
  readonly boulderId: BoulderId
}> {}
