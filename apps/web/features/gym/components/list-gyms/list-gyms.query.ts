import "server-only"
import { Effect } from "effect"

import { GymAdapterRuntime } from "@gym/adapters-next"
import { ListGymsController } from "@gym/adapters-next/controllers/list-gyms"

export async function listGyms() {
  return await GymAdapterRuntime.runPromise(
    ListGymsController({ redirectUrl: "/sign-in" }).pipe(
      Effect.flatMap(({ handle }) => handle())
    )
  )
}
