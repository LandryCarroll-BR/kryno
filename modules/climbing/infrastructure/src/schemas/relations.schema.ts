import { defineRelations } from "drizzle-orm"
import { climbingSessionsTable } from "./climbing-session.schema"

export const relations = defineRelations(
  { climbingSessions: climbingSessionsTable },
  () => ({})
)
