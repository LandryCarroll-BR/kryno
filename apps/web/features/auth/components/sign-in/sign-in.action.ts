"use server"

import "server-only"
import { Effect } from "effect"
import { AuthAdapterRuntime } from "@auth/adapters-next"
import { SignInController } from "@auth/adapters-next/controllers/sign-in"
import type { SignInViewModel } from "@auth/adapters-next/presenters/sign-in"

export async function signIn(_: SignInViewModel, formData: FormData) {
  return AuthAdapterRuntime.runPromise(
    SignInController({
      formData,
    }).pipe(
      Effect.flatMap(({ handle }) => handle({ redirectUrl: "/dashboard" }))
    )
  )
}
