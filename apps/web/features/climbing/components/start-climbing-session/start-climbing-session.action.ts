"use server"

import "server-only"
import { Effect } from "effect"
import { revalidatePath } from "next/cache"
import {
  ClimbingAdapterRuntime,
  StartClimbingSessionController,
  type StartClimbingSessionViewModel,
} from "@climbing/adapters-next"

export async function startClimbingSession(
  previousState: StartClimbingSessionViewModel
) {
  const result = await ClimbingAdapterRuntime.runPromise(
    StartClimbingSessionController({
      previousState,
      redirectUrl: "/sign-in",
    }).pipe(Effect.flatMap(({ handle }) => handle()))
  )

  if (result.status === "success") {
    revalidatePath("/dashboard")
  }

  return result
}
