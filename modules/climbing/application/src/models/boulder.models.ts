import { Schema } from "effect"

export type BoulderId = typeof BoulderId.Type
export const BoulderId = Schema.Trim.pipe(
  Schema.check(
    Schema.isMinLength(1, { message: "Boulder id must not be empty." })
  ),
  Schema.brand("BoulderId")
)

export const BoulderGrade = Schema.Literals([
  "VB",
  "V0",
  "V1",
  "V2",
  "V3",
  "V4",
  "V5",
  "V6",
  "V7",
  "V8",
  "V9",
  "V10",
  "V11",
  "V12",
  "V13",
  "V14",
  "V15",
  "V16",
  "V17",
])
export type BoulderGrade = typeof BoulderGrade.Type

export const WallAngle = Schema.Enum({
  SLAB: "SLAB",
  VERTICAL: "VERTICAL",
  OVERHANG: "OVERHANG",
  ROOF: "ROOF",
})
export type WallAngle = typeof WallAngle.Type

export const MovementStyle = Schema.Enum({
  COORDINATION: "COORDINATION",
  POWER: "POWER",
  TECHNICAL: "TECHNICAL",
})
export type MovementStyle = typeof MovementStyle.Type

export const WallAngles = Schema.NonEmptyArray(WallAngle).check(
  Schema.isUnique({ message: "Wall angles must be unique." })
)

export const MovementStyles = Schema.NonEmptyArray(MovementStyle).check(
  Schema.isUnique({ message: "Movement styles must be unique." })
)

export class Boulder extends Schema.Class<Boulder>("Boulder")({
  id: BoulderId,
  grade: BoulderGrade,
  wallAngles: WallAngles,
  movementStyles: MovementStyles,
}) {}
