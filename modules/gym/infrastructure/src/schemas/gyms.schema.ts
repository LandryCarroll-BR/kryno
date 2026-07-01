import type { GymId, GymName } from "@gym/application/models/gym"

import { gymSchema } from "./gym.schema"

export const gymsTable = gymSchema.table("gyms", (t) => ({
  id: t.char({ length: 24 }).$type<GymId>().primaryKey(),
  name: t.text().$type<GymName>().notNull(),
}))
