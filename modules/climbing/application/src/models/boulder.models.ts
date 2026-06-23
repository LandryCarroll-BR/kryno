import { Schema } from "effect"
import { NonEmptyString } from "effect/Schema"

export type BoulderId = typeof BoulderId.Type
export const BoulderId = NonEmptyString.pipe(Schema.brand("BoulderId"))

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
  "V10+",
])

export const BoulderType = Schema.Enum({
  SLAB: "SLAB",
  VERTICAL: "VERTICAL",
  OVERHANG: "OVERHANG",
  CAVE: "CAVE",
})

export const MovementStyle = Schema.Enum({
  COORDINATION: "COORDINATION",
  POWER: "POWER",
  TECHNICAL: "TECHNICAL",
})

export class Boulder extends Schema.Class<Boulder>("Boulder")({
  id: BoulderId,
  grade: BoulderGrade,
  type: BoulderType,
  movementStyle: MovementStyle,
}) {}
