"use server"

import "server-only"
import { Effect } from "effect"
import { SignOutController } from "@auth/adapters-next"
import { AuthAdapterRuntime } from "@auth/adapters-next"

export async function signOut() {
  return AuthAdapterRuntime.runPromise(
    SignOutController().pipe(
      Effect.flatMap(({ handle }) => handle({ redirectUrl: "/sign-in" }))
    )
  )
}
