import { Schema } from "effect"

import { GymId } from "./gym.models"

export type GymAreaId = typeof GymAreaId.Type
export const GymAreaId = Schema.NonEmptyString.pipe(Schema.brand("GymAreaId"))

export type GymAreaName = typeof GymAreaName.Type
export const GymAreaName = Schema.Trim.pipe(
  Schema.check(
    Schema.isMinLength(1, { message: "Area name must not be empty." })
  ),
  Schema.brand("GymAreaName")
)

export class GymArea extends Schema.Class<GymArea>("GymArea")({
  id: GymAreaId,
  gymId: GymId,
  name: GymAreaName,
}) {}
