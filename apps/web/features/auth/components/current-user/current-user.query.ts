import "server-only"
import { Effect, Option } from "effect"
import { redirect } from "next/navigation"

import {
  AuthAdapterRuntime,
  GetCurrentUserController,
} from "@auth/adapters-next"

export async function getCurrentUser() {
  const currentUser = await AuthAdapterRuntime.runPromise(
    GetCurrentUserController().pipe(Effect.flatMap(({ handle }) => handle()))
  )

  if (Option.isNone(currentUser)) {
    redirect("/sign-in")
  }

  return currentUser.value
}
