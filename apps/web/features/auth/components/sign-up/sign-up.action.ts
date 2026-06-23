"use server"

import "server-only"
import { Effect } from "effect"
import { SignUpController, SignUpViewModel } from "@auth/adapters-next"
import { AuthAdapterRuntime } from "@auth/adapters-next"

export async function signUp(
  previousState: SignUpViewModel,
  formData: FormData
) {
  return AuthAdapterRuntime.runPromise(
    SignUpController({
      previousState,
      formData,
    }).pipe(
      Effect.flatMap(({ handle }) => handle({ redirectUrl: "/dashboard" }))
    )
  )
}
