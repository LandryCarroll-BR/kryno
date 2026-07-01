import { uniqueIndex } from "drizzle-orm/pg-core"
import type { BoulderId } from "@climbing/application/models/boulder"
import type {
  GymRouteId,
  GymRouteOrder,
  GymRoutePositionLabel,
  GymRouteSetDate,
  GymRouteSetterName,
} from "@gym/application/models/gym-route"

import { gymAreasTable } from "./gym-areas.schema"
import { gymSchema } from "./gym.schema"

export const gymRoutesTable = gymSchema.table(
  "gym_routes",
  (t) => ({
    id: t.char({ length: 24 }).$type<GymRouteId>().primaryKey(),
    areaId: t
      .char({ length: 24 })
      .$type<typeof gymAreasTable.$inferSelect.id>()
      .notNull()
      .references(() => gymAreasTable.id, { onDelete: "cascade" }),
    order: t.integer().$type<GymRouteOrder>().notNull(),
    positionLabel: t.text().$type<GymRoutePositionLabel>(),
    setOn: t.date().$type<GymRouteSetDate>().notNull(),
    setterName: t.text().$type<GymRouteSetterName>(),
    boulderId: t.char({ length: 24 }).$type<BoulderId>(),
  }),
  (table) => [
    uniqueIndex("gym_routes_area_id_order_unique").on(
      table.areaId,
      table.order
    ),
  ]
)
