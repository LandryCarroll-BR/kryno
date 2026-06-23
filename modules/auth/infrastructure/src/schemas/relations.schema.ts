import { defineRelations } from "drizzle-orm"
import { sessionsTable } from "./session.schema"
import { usersTable } from "./user.schema"

export const relations = defineRelations(
  { users: usersTable, sessions: sessionsTable },
  (r) => ({
    users: {
      sessions: r.many.sessions({
        from: r.users.id,
        to: r.sessions.userId,
      }),
    },
    sessions: {
      user: r.one.users({
        from: r.sessions.userId,
        to: r.users.id,
        optional: false,
      }),
    },
  })
)
