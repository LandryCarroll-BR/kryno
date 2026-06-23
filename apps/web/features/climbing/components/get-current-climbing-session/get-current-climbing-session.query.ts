import "server-only"
import { Effect } from "effect"

import {
  ClimbingAdapterRuntime,
  GetCurrentClimbingSessionController,
} from "@climbing/adapters-next"

export async function getCurrentClimbingSession() {
  return await ClimbingAdapterRuntime.runPromise(
    GetCurrentClimbingSessionController({ redirectUrl: "/sign-in" }).pipe(
      Effect.flatMap(({ handle }) => handle())
    )
  )
}
