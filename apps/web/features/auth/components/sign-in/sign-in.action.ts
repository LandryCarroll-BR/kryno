"use server"

import "server-only"
import { Effect } from "effect"
import { SignInController, SignInViewModel } from "@auth/adapters-next"
import { AuthAdapterRuntime } from "@auth/adapters-next"

export async function signIn(
  previousState: SignInViewModel,
  formData: FormData
) {
  return AuthAdapterRuntime.runPromise(
    SignInController({
      previousState,
      formData,
    }).pipe(Effect.flatMap(({ handle }) => handle()))
  )
}
