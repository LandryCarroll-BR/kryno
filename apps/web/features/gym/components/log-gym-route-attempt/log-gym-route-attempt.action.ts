"use server"

import "server-only"
import { Effect } from "effect"
import { revalidatePath } from "next/cache"

import { GymAdapterRuntime } from "@gym/adapters-next"
import { LogGymRouteAttemptController } from "@gym/adapters-next/controllers/log-gym-route-attempt"
import type { LogGymRouteAttemptViewModel } from "@gym/adapters-next/view-models/log-gym-route-attempt"

export async function logGymRouteAttempt(
  previousState: LogGymRouteAttemptViewModel,
  formData: FormData
) {
  const result = await GymAdapterRuntime.runPromise(
    LogGymRouteAttemptController({
      previousState,
      redirectUrl: "/sign-in",
    }).pipe(Effect.flatMap(({ handle }) => handle(formData)))
  )

  if (result.status === "success") {
    revalidatePath(`/gyms/${result.fields.gymId.value}`)
  }

  return result
}
