"use server"

import "server-only"
import { Effect } from "effect"

import { GymAdapterRuntime } from "@gym/adapters-next"
import { CreateGymController } from "@gym/adapters-next/controllers/create-gym"
import type { CreateGymViewModel } from "@gym/adapters-next/view-models/create-gym"

export async function createGym(
  previousState: CreateGymViewModel,
  formData: FormData
) {
  return await GymAdapterRuntime.runPromise(
    CreateGymController({
      previousState,
      redirectUrl: "/sign-in",
    }).pipe(Effect.flatMap(({ handle }) => handle(formData)))
  )
}
