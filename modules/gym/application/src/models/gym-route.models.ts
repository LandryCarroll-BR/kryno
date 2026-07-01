import { Schema } from "effect"
import { BoulderId } from "@climbing/application/models/boulder"

import { GymAreaId } from "./gym-area.models"

export { BoulderId }

export type GymRouteId = typeof GymRouteId.Type
export const GymRouteId = Schema.NonEmptyString.pipe(
  Schema.brand("GymRouteId")
)

export type GymRouteOrder = typeof GymRouteOrder.Type
export const GymRouteOrder = Schema.Int.pipe(
  Schema.check(
    Schema.isGreaterThanOrEqualTo(1, {
      message: "Route order must be a positive integer.",
    })
  ),
  Schema.brand("GymRouteOrder")
)

export type GymRoutePositionLabel = typeof GymRoutePositionLabel.Type
export const GymRoutePositionLabel = Schema.Trim.pipe(
  Schema.check(
    Schema.isMinLength(1, {
      message: "Position label must not be empty when provided.",
    })
  ),
  Schema.brand("GymRoutePositionLabel")
)

export type GymRouteSetterName = typeof GymRouteSetterName.Type
export const GymRouteSetterName = Schema.Trim.pipe(
  Schema.check(
    Schema.isMinLength(1, {
      message: "Setter name must not be empty when provided.",
    })
  ),
  Schema.brand("GymRouteSetterName")
)

export type GymRouteSetDate = typeof GymRouteSetDate.Type
export const GymRouteSetDate = Schema.String.pipe(
  Schema.check(
    Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Set date must use YYYY-MM-DD format.",
    }),
    Schema.makeFilter((value) => {
      const date = new Date(`${value}T00:00:00.000Z`)
      return !Number.isNaN(date.getTime()) &&
          date.toISOString().slice(0, 10) === value
        ? undefined
        : "Set date must be a valid calendar date."
    })
  ),
  Schema.brand("GymRouteSetDate")
)

export class GymRoute extends Schema.Class<GymRoute>("GymRoute")({
  id: GymRouteId,
  areaId: GymAreaId,
  order: GymRouteOrder,
  positionLabel: Schema.OptionFromNullOr(GymRoutePositionLabel),
  setOn: GymRouteSetDate,
  setterName: Schema.OptionFromNullOr(GymRouteSetterName),
  boulderId: Schema.OptionFromNullOr(BoulderId),
}) {}
