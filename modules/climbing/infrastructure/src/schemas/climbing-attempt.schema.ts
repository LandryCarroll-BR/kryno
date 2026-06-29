import type {
  AttemptOrdinal,
  ClimbingAttemptId,
  ClimbingAttemptOutcome,
} from "@climbing/application/models/climbing-attempt"
import type { BoulderId } from "@climbing/application/models/boulder"
import type { ClimbingSessionId } from "@climbing/application/models/climbing-session"
import { uniqueIndex } from "drizzle-orm/pg-core"

import { bouldersTable } from "./boulder.schema"
import { climbingSchema } from "./climbing.schema"
import { climbingSessionsTable } from "./climbing-session.schema"

export const climbingAttemptsTable = climbingSchema.table(
  "climbing_attempts",
  (t) => ({
    id: t.char({ length: 24 }).$type<ClimbingAttemptId>().primaryKey(),
    sessionId: t
      .char({ length: 24 })
      .$type<ClimbingSessionId>()
      .notNull()
      .references(() => climbingSessionsTable.id, {
        onDelete: "cascade",
      }),
    boulderId: t
      .char({ length: 24 })
      .$type<BoulderId>()
      .notNull()
      .references(() => bouldersTable.id, {
        onDelete: "cascade",
      }),
    ordinal: t.integer().$type<AttemptOrdinal>().notNull(),
    outcome: t.text().$type<ClimbingAttemptOutcome>().notNull(),
    occurredAt: t.timestamp({ withTimezone: true }).notNull(),
    createdAt: t.timestamp({ withTimezone: true }).notNull(),
  }),
  (t) => [
    uniqueIndex("climbing_attempts_session_boulder_ordinal_unique").on(
      t.sessionId,
      t.boulderId,
      t.ordinal
    ),
  ]
)
