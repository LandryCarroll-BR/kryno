import { snakeCase } from "drizzle-orm/pg-core"

export const climbingSchema = snakeCase.schema("climbing").existing()
