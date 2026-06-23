import { Schema } from "effect"
import { NonEmptyString } from "effect/Schema"

export type ClimbingMoveId = typeof ClimbingMoveId.Type
export const ClimbingMoveId = NonEmptyString.pipe(
  Schema.brand("ClimbingMoveId")
)

export const ClimbingMoveName = Schema.Enum({
  ROCK_OVER: "ROCK_OVER",
  HEEL_HOOK: "HEEL_HOOK",
  DROP_KNEE: "DROP_KNEE",
  DEAD_POINT: "DEAD_POINT",
  DYNO: "DYNO",
})

export class ClimbingMove extends Schema.Class<ClimbingMove>("ClimbingMoves")({
  id: ClimbingMoveId,
  name: ClimbingMoveName,
}) {}
