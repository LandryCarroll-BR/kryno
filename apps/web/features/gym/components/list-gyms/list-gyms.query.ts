import "server-only"
import { Effect } from "effect"
import { connection } from "next/server"

import { GymAdapterRuntime } from "@gym/adapters-next"
import { ListGymsController } from "@gym/adapters-next/controllers/list-gyms"

export async function listGyms() {
  await connection()

  return await GymAdapterRuntime.runPromise(
    ListGymsController({ redirectUrl: "/sign-in" }).pipe(
      Effect.flatMap(({ handle }) => handle())
    )
  )
}
