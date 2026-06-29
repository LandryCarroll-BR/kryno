import { bytea } from "drizzle-orm/pg-core"
import type {
  SessionId,
  SessionSecretHash,
} from "@auth/application/models/session"
import type { UserId } from "@auth/application/models/user"

import { authSchema } from "./auth.schema"
import { usersTable } from "./user.schema"

export const sessionsTable = authSchema.table("sessions", (t) => ({
  id: t.char({ length: 24 }).$type<SessionId>().primaryKey(),
  userId: t
    .char({ length: 24 })
    .$type<UserId>()
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
    }),
  secretHash: bytea().$type<SessionSecretHash>().notNull(),
  lastVerifiedAt: t.timestamp({ withTimezone: true }).notNull(),
  createdAt: t.timestamp({ withTimezone: true }).notNull(),
}))
