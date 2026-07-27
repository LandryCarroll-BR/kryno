"use server"

import "server-only"
import { revalidatePath } from "next/cache"
import { Effect } from "effect"
import { GymAdapterRuntime } from "@gym/adapters-next"
import { DeleteGymAreaController } from "@gym/adapters-next/controllers/delete-gym-area"
import type { DeleteGymAreaViewModel } from "@gym/adapters-next/view-models"

export async function deleteGymArea(
  previousState: DeleteGymAreaViewModel,
  formData: FormData
) {
  const result = await GymAdapterRuntime.runPromise(
    DeleteGymAreaController({
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
