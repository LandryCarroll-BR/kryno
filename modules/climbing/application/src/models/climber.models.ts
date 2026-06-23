import { Schema } from "effect"
import { NonEmptyString } from "effect/Schema"

export type ClimberId = typeof ClimberId.Type
export const ClimberId = NonEmptyString.pipe(Schema.brand("ClimberId"))

export class Climber extends Schema.Class<Climber>("Climber")({
  id: ClimberId,
}) {}
