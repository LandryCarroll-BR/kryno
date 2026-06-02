import { describe, expect, it } from "@effect/vitest"
import { pgTable, text } from "drizzle-orm/pg-core"
import { Layer } from "effect"

import {
  KrynoDatabaseLive,
  krynoSchema,
  mergeSchemaContributions,
} from "../src/index.ts"

describe("@workspace/database", () => {
  it("merges module schema contributions into the product schema", () => {
    const users = pgTable("users", {
      id: text("id").primaryKey(),
    })
    const gyms = pgTable("gyms", {
      id: text("id").primaryKey(),
    })

    const schema = mergeSchemaContributions([{ users }, { gyms }])

    expect(schema).toEqual({ users, gyms })
    expect(Object.isFrozen(schema)).toBe(true)
  })

  it("starts with an intentionally empty merged schema until modules contribute tables", () => {
    expect(krynoSchema).toEqual({})
  })

  it("exports the product Drizzle database layer for application composition", () => {
    expect(Layer.isLayer(KrynoDatabaseLive)).toBe(true)
  })
})
