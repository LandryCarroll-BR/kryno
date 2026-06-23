"use server"

import "server-only"
import { Effect } from "effect"
import { SignInController, SignInViewModel } from "@auth/adapters-next"
import { AuthAdapterRuntime } from "@auth/adapters-next"

export async function signIn(_: SignInViewModel, formData: FormData) {
  return AuthAdapterRuntime.runPromise(
    SignInController({
      formData,
    }).pipe(
      Effect.flatMap(({ handle }) => handle({ redirectUrl: "/dashboard" }))
    )
  )
}
