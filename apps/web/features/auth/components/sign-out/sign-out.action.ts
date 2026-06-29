"use server"

import "server-only"
import { Effect } from "effect"
import { AuthAdapterRuntime } from "@auth/adapters-next"
import { SignOutController } from "@auth/adapters-next/controllers/sign-out"

export async function signOut() {
  return AuthAdapterRuntime.runPromise(
    SignOutController({ redirectUrl: "/sign-in" }).pipe(
      Effect.flatMap(({ handle }) => handle())
    )
  )
}
