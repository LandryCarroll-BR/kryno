import "server-only"
import { Effect } from "effect"

import { AuthAdapterRuntime } from "@auth/adapters-next"
import { GetCurrentUserController } from "@auth/adapters-next/controllers/get-current-user"

export async function getCurrentUser() {
  return await AuthAdapterRuntime.runPromise(
    GetCurrentUserController({ redirectUrl: "/sign-in" }).pipe(
      Effect.flatMap(({ handle }) => handle())
    )
  )
}
