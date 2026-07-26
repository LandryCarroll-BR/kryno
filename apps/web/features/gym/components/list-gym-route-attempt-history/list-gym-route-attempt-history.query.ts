import "server-only"
import { Effect } from "effect"
import { connection } from "next/server"

import { GymAdapterRuntime } from "@gym/adapters-next"
import { ListGymRouteAttemptHistoryController } from "@gym/adapters-next/controllers/list-gym-route-attempt-history"

export async function listGymRouteAttemptHistory(gymId: string) {
  await connection()

  return await GymAdapterRuntime.runPromise(
    ListGymRouteAttemptHistoryController({
      gymId,
      redirectUrl: "/sign-in",
    }).pipe(Effect.flatMap(({ handle }) => handle()))
  )
}
