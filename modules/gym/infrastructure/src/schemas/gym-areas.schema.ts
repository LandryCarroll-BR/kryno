import { uniqueIndex } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import type {
  GymAreaId,
  GymAreaName,
} from "@gym/application/models/gym-area"

import { gymSchema } from "./gym.schema"
import { gymsTable } from "./gyms.schema"

export const gymAreasTable = gymSchema.table(
  "gym_areas",
  (t) => ({
    id: t.char({ length: 24 }).$type<GymAreaId>().primaryKey(),
    gymId: t
      .char({ length: 24 })
      .$type<typeof gymsTable.$inferSelect.id>()
      .notNull()
      .references(() => gymsTable.id, { onDelete: "cascade" }),
    name: t.text().$type<GymAreaName>().notNull(),
  }),
  (table) => [
    uniqueIndex("gym_areas_gym_id_lower_name_unique").on(
      table.gymId,
      sql`lower(${table.name})`
    ),
  ]
)
