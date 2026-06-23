import { sql } from "drizzle-orm"
import { uniqueIndex } from "drizzle-orm/pg-core"

import type { ClimberId, ClimbingSessionId } from "@climbing/application"

import { climbingSchema } from "./climbing.schema"

export const climbingSessionsTable = climbingSchema.table(
  "climbing_sessions",
  (t) => ({
    id: t.char({ length: 24 }).$type<ClimbingSessionId>().primaryKey(),
    climberId: t.char({ length: 24 }).$type<ClimberId>().notNull(),
    startedAt: t.timestamp({ withTimezone: true }).notNull(),
    endedAt: t.timestamp({ withTimezone: true }),
  }),
  (t) => [
    uniqueIndex("climbing_sessions_one_active_per_climber")
      .on(t.climberId)
      .where(sql`${t.endedAt} is null`),
  ]
)
