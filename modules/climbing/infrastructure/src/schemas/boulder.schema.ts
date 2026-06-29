import type {
  BoulderGrade,
  BoulderId,
  BoulderName,
  MovementStyle,
  WallAngle,
} from "@climbing/application/models/boulder"
import type { ClimberId } from "@climbing/application/models/climber"

import { climbingSchema } from "./climbing.schema"

export const bouldersTable = climbingSchema.table("boulders", (t) => ({
  id: t.char({ length: 24 }).$type<BoulderId>().primaryKey(),
  creatorClimberId: t.char({ length: 24 }).$type<ClimberId>().notNull(),
  name: t.text().$type<BoulderName>().notNull(),
  grade: t.text().$type<BoulderGrade>().notNull(),
  wallAngle: t.text().$type<WallAngle>().notNull(),
  movementStyle: t.text().$type<MovementStyle>().notNull(),
  createdAt: t.timestamp({ withTimezone: true }).notNull(),
  updatedAt: t.timestamp({ withTimezone: true }).notNull(),
}))
