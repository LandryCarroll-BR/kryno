import "server-only"
import { Effect } from "effect"

import {
  ClimbingAdapterRuntime,
  ListCreatedBouldersController,
} from "@climbing/adapters-next"

export async function listCreatedBoulders() {
  return await ClimbingAdapterRuntime.runPromise(
    ListCreatedBouldersController({ redirectUrl: "/sign-in" }).pipe(
      Effect.flatMap(({ handle }) => handle())
    )
  )
}
