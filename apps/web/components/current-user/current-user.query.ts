import { Effect, Option } from "effect"

import {
  AuthAdapterRuntime,
  GetCurrentUserController,
} from "@auth/adapters-next"

export async function getCurrentUser() {
  const currentUser = await AuthAdapterRuntime.runPromise(
    GetCurrentUserController().pipe(Effect.flatMap(({ handle }) => handle()))
  )

  return Option.getOrNull(currentUser)
}
