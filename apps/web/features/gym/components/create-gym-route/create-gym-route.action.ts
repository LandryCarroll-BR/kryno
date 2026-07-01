"use server"

import "server-only"
import { revalidatePath } from "next/cache"
import { Effect } from "effect"
import { GymAdapterRuntime } from "@gym/adapters-next"
import { CreateGymRouteController } from "@gym/adapters-next/controllers/create-gym-route"
import type { CreateGymRouteViewModel } from "@gym/adapters-next/view-models/create-gym-route"

export async function createGymRoute(
  previousState: CreateGymRouteViewModel,
  formData: FormData
) {
  const result = await GymAdapterRuntime.runPromise(
    CreateGymRouteController({
      previousState,
      redirectUrl: "/sign-in",
    }).pipe(Effect.flatMap(({ handle }) => handle(formData)))
  )

  if (result.status === "success") {
    const gymId = formData.get("gymId")
    if (typeof gymId === "string") {
      revalidatePath(`/gyms/${gymId}/manage`)
    }
  }

  return result
}
