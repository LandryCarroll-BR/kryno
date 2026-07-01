import { index, primaryKey } from "drizzle-orm/pg-core"
import type {
  GymMemberId,
} from "@gym/application/models/gym-membership"

import { gymSchema } from "./gym.schema"
import { gymsTable } from "./gyms.schema"

export const gymMembershipsTable = gymSchema.table(
  "gym_memberships",
  (t) => ({
    gymId: t
      .char({ length: 24 })
      .$type<typeof gymsTable.$inferSelect.id>()
      .notNull()
      .references(() => gymsTable.id, { onDelete: "cascade" }),
    memberId: t.char({ length: 24 }).$type<GymMemberId>().notNull(),
    joinedAt: t.timestamp({ withTimezone: true }).notNull(),
  }),
  (table) => [
    primaryKey({
      columns: [table.gymId, table.memberId],
    }),
    index("gym_memberships_member_id_index").on(table.memberId),
  ]
)
