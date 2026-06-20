import type {
  Role,
  SessionId,
  SessionSecretHash,
  UserId,
} from "@auth/application"
import { bytea, pgTable } from "drizzle-orm/pg-core"

export const sessionsTable = pgTable("sessions", (t) => ({
  id: t.char({ length: 24 }).$type<SessionId>().primaryKey(),
  userId: t.char({ length: 24 }).$type<UserId>().notNull(),
  role: t
    .text({ enum: ["user", "admin"] })
    .$type<Role>()
    .notNull()
    .default("user"),
  secretHash: bytea().$type<SessionSecretHash>().notNull(),
  lastVerifiedAt: t.timestamp({ withTimezone: true }).notNull(),
  createdAt: t.timestamp({ withTimezone: true }).notNull(),
}))
