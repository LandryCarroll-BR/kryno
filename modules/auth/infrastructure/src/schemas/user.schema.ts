import { bytea } from "drizzle-orm/pg-core"
import type { PasswordHash, Role, UserId } from "@auth/application/models/user"
import { authSchema } from "./auth.schema"

export const usersTable = authSchema.table("users", (t) => ({
  id: t.char({ length: 24 }).$type<UserId>().primaryKey(),
  username: t.text().notNull().unique(),
  email: t.text().notNull().unique(),
  passwordHash: bytea().$type<PasswordHash>().notNull(),
  createdAt: t.timestamp({ withTimezone: true }).notNull(),
  role: t
    .text({ enum: ["user", "admin"] })
    .$type<Role>()
    .notNull()
    .default("user"),
}))
