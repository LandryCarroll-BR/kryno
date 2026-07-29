"use server"

import "server-only"
import { revalidatePath } from "next/cache"
import { Effect } from "effect"
import { GymAdapterRuntime } from "@gym/adapters-next"
import { EditGymRouteController } from "@gym/adapters-next/controllers/edit-gym-route"
import type { EditGymRouteViewModel } from "@gym/adapters-next/view-models/edit-gym-route"

export async function editGymRoute(
  previousState: EditGymRouteViewModel,
  formData: FormData
) {
  const result = await GymAdapterRuntime.runPromise(
    EditGymRouteController({
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
