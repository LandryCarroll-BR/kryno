import "server-only"
import { Effect } from "effect"
import { connection } from "next/server"

import { GymAdapterRuntime } from "@gym/adapters-next"
import { GetGymManagementController } from "@gym/adapters-next/controllers/get-gym-management"

export async function getGymManagement(gymId: string) {
  await connection()

  return await GymAdapterRuntime.runPromise(
    GetGymManagementController({
      gymId,
      redirectUrl: "/sign-in",
      unauthorizedRedirectUrl: "/dashboard",
    }).pipe(Effect.flatMap(({ handle }) => handle()))
  )
}
