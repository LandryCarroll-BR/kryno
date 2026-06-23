import { defineRelations } from "drizzle-orm"
import { bouldersTable } from "./boulder.schema"
import { climbingAttemptsTable } from "./climbing-attempt.schema"
import { climbingSessionsTable } from "./climbing-session.schema"

export const relations = defineRelations(
  {
    boulders: bouldersTable,
    climbingAttempts: climbingAttemptsTable,
    climbingSessions: climbingSessionsTable,
  },
  (r) => ({
    boulders: {
      attempts: r.many.climbingAttempts({
        from: r.boulders.id,
        to: r.climbingAttempts.boulderId,
      }),
    },
    climbingAttempts: {
      boulder: r.one.boulders({
        from: r.climbingAttempts.boulderId,
        to: r.boulders.id,
        optional: false,
      }),
      session: r.one.climbingSessions({
        from: r.climbingAttempts.sessionId,
        to: r.climbingSessions.id,
        optional: false,
      }),
    },
    climbingSessions: {
      attempts: r.many.climbingAttempts({
        from: r.climbingSessions.id,
        to: r.climbingAttempts.sessionId,
      }),
    },
  })
)
