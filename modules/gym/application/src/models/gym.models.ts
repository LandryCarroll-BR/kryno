import { Schema } from "effect"

export type GymId = typeof GymId.Type
export const GymId = Schema.NonEmptyString.pipe(Schema.brand("GymId"))

export type GymName = typeof GymName.Type
export const GymName = Schema.Trim.pipe(
  Schema.check(
    Schema.isMinLength(1, { message: "Gym name must not be empty." })
  ),
  Schema.brand("GymName")
)

export class Gym extends Schema.Class<Gym>("Gym")({
  id: GymId,
  name: GymName,
}) {}
