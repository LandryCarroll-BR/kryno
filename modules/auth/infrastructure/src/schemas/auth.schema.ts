import { snakeCase } from "drizzle-orm/pg-core"

export const authSchema = snakeCase.schema("auth")
