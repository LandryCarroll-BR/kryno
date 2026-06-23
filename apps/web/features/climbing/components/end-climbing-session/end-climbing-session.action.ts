"use server"

import "server-only"
import { Effect } from "effect"
import {
  ClimbingAdapterRuntime,
  EndClimbingSessionController,
  type EndClimbingSessionViewModel,
} from "@climbing/adapters-next"

export async function endClimbingSession(
  previousState: EndClimbingSessionViewModel
) {
  return ClimbingAdapterRuntime.runPromise(
    EndClimbingSessionController({
      previousState,
      redirectUrl: "/sign-in",
    }).pipe(Effect.flatMap(({ handle }) => handle()))
  )
}
