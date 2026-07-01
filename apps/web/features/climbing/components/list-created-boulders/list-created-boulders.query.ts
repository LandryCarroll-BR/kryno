import "server-only"
import { Effect } from "effect"
import { connection } from "next/server"

import { ClimbingAdapterRuntime } from "@climbing/adapters-next"
import { ListCreatedBouldersController } from "@climbing/adapters-next/controllers/list-created-boulders"

export async function listCreatedBoulders() {
  await connection()

  return await ClimbingAdapterRuntime.runPromise(
    ListCreatedBouldersController({ redirectUrl: "/sign-in" }).pipe(
      Effect.flatMap(({ handle }) => handle())
    )
  )
}
