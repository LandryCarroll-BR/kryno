import { snakeCase } from "drizzle-orm/pg-core"

export const gymSchema = snakeCase.schema("gym").existing()
