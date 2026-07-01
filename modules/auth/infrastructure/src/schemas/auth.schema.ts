import { snakeCase } from "drizzle-orm/pg-core"

export const authSchema = snakeCase.schema("kryno_auth").existing()
