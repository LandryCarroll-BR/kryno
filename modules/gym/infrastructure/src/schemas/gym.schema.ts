import { snakeCase } from "drizzle-orm/pg-core"

export const gymSchema = snakeCase.schema("kryno_gym").existing()
