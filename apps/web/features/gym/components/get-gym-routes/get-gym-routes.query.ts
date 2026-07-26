import "server-only"
import { Effect } from "effect"
import { connection } from "next/server"

import { GymAdapterRuntime } from "@gym/adapters-next"
import { GetGymRoutesController } from "@gym/adapters-next/controllers/get-gym-routes"

export async function getGymRoutes(gymId: string) {
  await connection()

  return await GymAdapterRuntime.runPromise(
    GetGymRoutesController({
      gymId,
      redirectUrl: "/sign-in",
    }).pipe(Effect.flatMap(({ handle }) => handle()))
  )
}
