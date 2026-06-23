import "server-only"
import { Effect } from "effect"

import {
  AuthAdapterRuntime,
  GetCurrentUserController,
} from "@auth/adapters-next"

export async function getCurrentUser() {
  return await AuthAdapterRuntime.runPromise(
    GetCurrentUserController({ redirectUrl: "/sign-in" }).pipe(
      Effect.flatMap(({ handle }) => handle())
    )
  )
}
