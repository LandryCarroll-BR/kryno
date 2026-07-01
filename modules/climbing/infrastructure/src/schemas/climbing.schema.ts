import { snakeCase } from "drizzle-orm/pg-core"

export const climbingSchema = snakeCase.schema("kryno_climbing").existing()
