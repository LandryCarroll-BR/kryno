import "server-only"
import { Effect } from "effect"
import { connection } from "next/server"

import { ClimbingAdapterRuntime } from "@climbing/adapters-next"
import { GetCurrentClimbingSessionController } from "@climbing/adapters-next/controllers/get-current-climbing-session"

export async function getCurrentClimbingSession() {
  await connection()

  return await ClimbingAdapterRuntime.runPromise(
    GetCurrentClimbingSessionController({ redirectUrl: "/sign-in" }).pipe(
      Effect.flatMap(({ handle }) => handle())
    )
  )
}
