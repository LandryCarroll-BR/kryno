"use server"

import "server-only"
import { Effect } from "effect"
import { redirect } from "next/navigation"
import { AuthAdapterRuntime } from "@auth/adapters-next"
import { SignInController } from "@auth/adapters-next/controllers/sign-in"
import type { SignInViewModel } from "@auth/adapters-next/view-models/sign-in"

export async function signIn(
  previousState: SignInViewModel,
  formData: FormData
) {
  const result = await AuthAdapterRuntime.runPromise(
    SignInController({
      previousState,
    }).pipe(Effect.flatMap(({ handle }) => handle(formData)))
  )

  if (result.status === "success") {
    redirect("/dashboard")
  }

  return result
}
