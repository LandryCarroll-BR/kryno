"use server"

import "server-only"
import { Effect } from "effect"
import { revalidatePath } from "next/cache"

import {
  ClimbingAdapterRuntime,
  CreateBoulderController,
  type CreateBoulderViewModel,
} from "@climbing/adapters-next"

export async function createBoulder(
  previousState: CreateBoulderViewModel,
  formData: FormData
) {
  const result = await ClimbingAdapterRuntime.runPromise(
    CreateBoulderController({
      previousState,
      redirectUrl: "/sign-in",
    }).pipe(Effect.flatMap(({ handle }) => handle(formData)))
  )

  if (result.status === "success") {
    revalidatePath("/dashboard")
  }

  return result
}
