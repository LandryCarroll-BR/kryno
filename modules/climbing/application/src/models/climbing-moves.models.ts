import { Schema } from "effect"

export const ClimbingMove = Schema.Enum({
  ROCK_OVER: "ROCK_OVER",
  HEEL_HOOK: "HEEL_HOOK",
  DROP_KNEE: "DROP_KNEE",
  DEAD_POINT: "DEAD_POINT",
  DYNO: "DYNO",
})
export type ClimbingMove = typeof ClimbingMove.Type
