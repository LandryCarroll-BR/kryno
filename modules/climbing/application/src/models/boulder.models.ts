import { Schema } from "effect"

import { ClimberId } from "./climber.models"

export type BoulderId = typeof BoulderId.Type
export const BoulderId = Schema.Trim.pipe(
  Schema.check(
    Schema.isMinLength(1, { message: "Boulder id must not be empty." })
  ),
  Schema.brand("BoulderId")
)

export type BoulderName = typeof BoulderName.Type
export const BoulderName = Schema.Trim.pipe(
  Schema.check(
    Schema.isMinLength(1, { message: "Boulder name must not be empty." })
  ),
  Schema.brand("BoulderName")
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

export class Boulder extends Schema.Class<Boulder>("Boulder")({
  id: BoulderId,
  creatorClimberId: ClimberId,
  name: BoulderName,
  grade: BoulderGrade,
  wallAngle: WallAngle,
  movementStyle: MovementStyle,
}) {}
