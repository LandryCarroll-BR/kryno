"use server"

import "server-only"
import { Effect } from "effect"
import { revalidatePath } from "next/cache"

import { GymAdapterRuntime } from "@gym/adapters-next"
import { JoinGymController } from "@gym/adapters-next/controllers/join-gym"
import type { JoinGymViewModel } from "@gym/adapters-next/view-models/join-gym"

export async function joinGym(
  previousState: JoinGymViewModel,
  formData: FormData
) {
  const result = await GymAdapterRuntime.runPromise(
    JoinGymController({
      previousState,
      redirectUrl: "/sign-in",
    }).pipe(Effect.flatMap(({ handle }) => handle(formData)))
  )

  if (result.status === "success") {
    revalidatePath("/gyms")
  }

  return result
}
