import { Schema } from "effect"

export type ClimberId = typeof ClimberId.Type
export const ClimberId = Schema.Trim.pipe(
  Schema.check(
    Schema.isMinLength(1, { message: "Climber id must not be empty." })
  ),
  Schema.brand("ClimberId")
)

export class Climber extends Schema.Class<Climber>("Climber")({
  id: ClimberId,
}) {}
