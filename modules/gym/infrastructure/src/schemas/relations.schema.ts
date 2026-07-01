import { defineRelations } from "drizzle-orm"

import { gymMembershipsTable } from "./gym-memberships.schema"
import { gymAreasTable } from "./gym-areas.schema"
import { gymRoutesTable } from "./gym-routes.schema"
import { gymsTable } from "./gyms.schema"

export const relations = defineRelations(
  {
    gymMemberships: gymMembershipsTable,
    gymAreas: gymAreasTable,
    gymRoutes: gymRoutesTable,
    gyms: gymsTable,
  },
  (r) => ({
    gymMemberships: {
      gym: r.one.gyms({
        from: r.gymMemberships.gymId,
        to: r.gyms.id,
        optional: false,
      }),
    },
    gymAreas: {
      gym: r.one.gyms({
        from: r.gymAreas.gymId,
        to: r.gyms.id,
        optional: false,
      }),
      routes: r.many.gymRoutes({
        from: r.gymAreas.id,
        to: r.gymRoutes.areaId,
      }),
    },
    gymRoutes: {
      area: r.one.gymAreas({
        from: r.gymRoutes.areaId,
        to: r.gymAreas.id,
        optional: false,
      }),
    },
    gyms: {
      areas: r.many.gymAreas({
        from: r.gyms.id,
        to: r.gymAreas.gymId,
      }),
      memberships: r.many.gymMemberships({
        from: r.gyms.id,
        to: r.gymMemberships.gymId,
      }),
    },
  })
)
