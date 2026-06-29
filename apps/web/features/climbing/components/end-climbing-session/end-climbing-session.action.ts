"use server"

import "server-only"
import { Effect } from "effect"
import { revalidatePath } from "next/cache"

import { ClimbingAdapterRuntime } from "@climbing/adapters-next"
import { EndClimbingSessionController } from "@climbing/adapters-next/controllers/end-climbing-session"
import type { EndClimbingSessionViewModel } from "@climbing/adapters-next/view-models/end-climbing-session"

export async function endClimbingSession(
  previousState: EndClimbingSessionViewModel,
  formData: FormData
) {
  const result = await ClimbingAdapterRuntime.runPromise(
    EndClimbingSessionController({
      previousState,
      redirectUrl: "/sign-in",
    }).pipe(Effect.flatMap(({ handle }) => handle(formData)))
  )

  if (result.status === "success") {
    revalidatePath("/dashboard")
  }

  return result
}
