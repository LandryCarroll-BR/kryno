import type {
  BoulderGrade,
  BoulderId,
  BoulderName,
  ClimberId,
  MovementStyle,
  WallAngle,
} from "@climbing/application"

import { climbingSchema } from "./climbing.schema"

export const bouldersTable = climbingSchema.table("boulders", (t) => ({
  id: t.char({ length: 24 }).$type<BoulderId>().primaryKey(),
  creatorClimberId: t.char({ length: 24 }).$type<ClimberId>().notNull(),
  name: t.text().$type<BoulderName>().notNull(),
  grade: t.text().$type<BoulderGrade>().notNull(),
  wallAngle: t.text().$type<WallAngle>().notNull(),
  movementStyle: t.text().$type<MovementStyle>().notNull(),
}))
