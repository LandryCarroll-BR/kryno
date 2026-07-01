import { defineRelations } from "drizzle-orm"

import { gymMembershipsTable } from "./gym-memberships.schema"
import { gymsTable } from "./gyms.schema"

export const relations = defineRelations(
  {
    gymMemberships: gymMembershipsTable,
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
    gyms: {
      memberships: r.many.gymMemberships({
        from: r.gyms.id,
        to: r.gymMemberships.gymId,
      }),
    },
  })
)
