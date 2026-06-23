import { defineRelations } from "drizzle-orm"
import { bouldersTable } from "./boulder.schema"
import { climbingSessionsTable } from "./climbing-session.schema"

export const relations = defineRelations(
  { boulders: bouldersTable, climbingSessions: climbingSessionsTable },
  () => ({})
)
