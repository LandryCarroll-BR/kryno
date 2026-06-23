"use server"

import "server-only"
import { Effect } from "effect"
import {
  ClimbingAdapterRuntime,
  StartClimbingSessionController,
  type StartClimbingSessionViewModel,
} from "@climbing/adapters-next"

export async function startClimbingSession(
  previousState: StartClimbingSessionViewModel
) {
  return ClimbingAdapterRuntime.runPromise(
    StartClimbingSessionController({
      previousState,
      redirectUrl: "/sign-in",
    }).pipe(Effect.flatMap(({ handle }) => handle()))
  )
}
