"use server"

import "server-only"
import { Effect } from "effect"
import { revalidatePath } from "next/cache"

import { ClimbingAdapterRuntime } from "@climbing/adapters-next"
import { StartClimbingSessionViewModel } from "@climbing/adapters-next/presenters/start-climbing-session"
import { StartClimbingSessionController } from "@climbing/adapters-next/controllers/start-climbing-session"

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
