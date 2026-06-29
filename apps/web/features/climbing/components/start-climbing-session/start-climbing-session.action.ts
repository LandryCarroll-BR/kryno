"use server"

import "server-only"
import { Effect } from "effect"
import { revalidatePath } from "next/cache"

import { ClimbingAdapterRuntime } from "@climbing/adapters-next"
import { StartClimbingSessionController } from "@climbing/adapters-next/controllers/start-climbing-session"
import type { StartClimbingSessionViewModel } from "@climbing/adapters-next/view-models/start-climbing-session"

export async function startClimbingSession(
  previousState: StartClimbingSessionViewModel,
  formData: FormData
) {
  const result = await ClimbingAdapterRuntime.runPromise(
    StartClimbingSessionController({
      previousState,
      redirectUrl: "/sign-in",
    }).pipe(Effect.flatMap(({ handle }) => handle(formData)))
  )

  if (result.status === "success") {
    revalidatePath("/dashboard")
  }

  return result
}
