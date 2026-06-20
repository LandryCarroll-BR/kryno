import { sessionsTable } from "@/schemas/session.schema"
import { usersTable } from "@/schemas/user.schema"
import { defineRelations } from "drizzle-orm"

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
