"use server"

import "server-only"
import { revalidatePath } from "next/cache"
import { Effect } from "effect"
import { GymAdapterRuntime } from "@gym/adapters-next"
import { CreateGymAreaController } from "@gym/adapters-next/controllers/create-gym-area"
import type { CreateGymAreaViewModel } from "@gym/adapters-next/view-models/create-gym-area"

export async function createGymArea(
  previousState: CreateGymAreaViewModel,
  formData: FormData
) {
  const result = await GymAdapterRuntime.runPromise(
    CreateGymAreaController({
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
