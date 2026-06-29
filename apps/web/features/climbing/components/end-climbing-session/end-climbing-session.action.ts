"use server"

import "server-only"
import { Effect } from "effect"
import { revalidatePath } from "next/cache"

import { ClimbingAdapterRuntime } from "@climbing/adapters-next"
import { EndClimbingSessionViewModel } from "@climbing/adapters-next/presenters/end-climbing-session"
import { EndClimbingSessionController } from "@climbing/adapters-next/controllers/end-climbing-session"

export async function endClimbingSession(
  previousState: EndClimbingSessionViewModel
) {
  const controllerPreviousState: EndClimbingSessionViewModel =
    previousState.status === "active" ? { status: "idle" } : previousState

  const result = await ClimbingAdapterRuntime.runPromise(
    EndClimbingSessionController({
      previousState: controllerPreviousState,
      redirectUrl: "/sign-in",
    }).pipe(Effect.flatMap(({ handle }) => handle()))
  )

  if (result.status === "ended" || result.status === "error") {
    revalidatePath("/dashboard")
  }

  return result
}
