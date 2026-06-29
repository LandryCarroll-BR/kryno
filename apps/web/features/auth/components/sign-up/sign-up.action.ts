"use server"

import "server-only"
import { Effect } from "effect"
import { AuthAdapterRuntime } from "@auth/adapters-next"
import { SignUpController } from "@auth/adapters-next/controllers/sign-up"
import type { SignUpViewModel } from "@auth/adapters-next/presenters/sign-up"

export async function signUp(_: SignUpViewModel, formData: FormData) {
  return AuthAdapterRuntime.runPromise(
    SignUpController({
      formData,
    }).pipe(
      Effect.flatMap(({ handle }) => handle({ redirectUrl: "/dashboard" }))
    )
  )
}
