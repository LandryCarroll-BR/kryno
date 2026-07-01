import { defineRelations } from "drizzle-orm"

import { gymsTable } from "./gyms.schema"

export const relations = defineRelations({ gyms: gymsTable }, () => ({}))
