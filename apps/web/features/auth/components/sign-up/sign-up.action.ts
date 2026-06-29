"use server"

import "server-only"
import { Effect } from "effect"
import { redirect } from "next/navigation"
import { AuthAdapterRuntime } from "@auth/adapters-next"
import { SignUpController } from "@auth/adapters-next/controllers/sign-up"
import type { SignUpViewModel } from "@auth/adapters-next/view-models/sign-up"

export async function signUp(
  previousState: SignUpViewModel,
  formData: FormData
) {
  const result = await AuthAdapterRuntime.runPromise(
    SignUpController({
      previousState,
    }).pipe(Effect.flatMap(({ handle }) => handle(formData)))
  )

  if (result.status === "success") {
    redirect("/dashboard")
  }

  return result
}
