"use server"

import "server-only"
import { Effect } from "effect"
import { revalidatePath } from "next/cache"

import { ClimbingAdapterRuntime } from "@climbing/adapters-next"
import { DeleteBoulderController } from "@climbing/adapters-next/controllers/delete-boulder"
import type { DeleteBoulderViewModel } from "@climbing/adapters-next/view-models/delete-boulder"

export async function deleteBoulder(
  previousState: DeleteBoulderViewModel,
  formData: FormData
) {
  const result = await ClimbingAdapterRuntime.runPromise(
    DeleteBoulderController({
      previousState,
      redirectUrl: "/sign-in",
    }).pipe(Effect.flatMap(({ handle }) => handle(formData)))
  )

  if (result.status === "success") {
    revalidatePath("/dashboard")
  }

  return result
}
