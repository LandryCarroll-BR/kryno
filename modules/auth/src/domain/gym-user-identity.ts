import { Schema } from "effect"

export const GymUserId = Schema.String.pipe(Schema.brand("GymUserId"))
export type GymUserId = typeof GymUserId.Type

export const GymUserSessionId = Schema.String.pipe(
  Schema.brand("GymUserSessionId")
)
export type GymUserSessionId = typeof GymUserSessionId.Type
