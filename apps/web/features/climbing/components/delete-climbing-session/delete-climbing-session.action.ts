"use server"

import "server-only"
import { Effect } from "effect"
import { revalidatePath } from "next/cache"

import { ClimbingAdapterRuntime } from "@climbing/adapters-next"
import { DeleteClimbingSessionController } from "@climbing/adapters-next/controllers/delete-climbing-session"
import type { DeleteClimbingSessionViewModel } from "@climbing/adapters-next/view-models/delete-climbing-session"

export async function deleteClimbingSession(
  previousState: DeleteClimbingSessionViewModel,
  formData: FormData
) {
  const result = await ClimbingAdapterRuntime.runPromise(
    DeleteClimbingSessionController({
      previousState,
      redirectUrl: "/sign-in",
    }).pipe(Effect.flatMap(({ handle }) => handle(formData)))
  )

  if (result.status === "success") {
    revalidatePath("/dashboard")
  }

  return result
}
