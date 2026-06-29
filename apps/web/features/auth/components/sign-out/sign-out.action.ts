"use server"

import "server-only"
import { Effect } from "effect"
import { redirect } from "next/navigation"
import { AuthAdapterRuntime } from "@auth/adapters-next"
import { SignOutController } from "@auth/adapters-next/controllers/sign-out"
import type { SignOutViewModel } from "@auth/adapters-next/view-models/sign-out"

export async function signOut(
  previousState: SignOutViewModel,
  formData: FormData
) {
  const result = await AuthAdapterRuntime.runPromise(
    SignOutController({ previousState }).pipe(
      Effect.flatMap(({ handle }) => handle(formData))
    )
  )

  if (result.status === "success") {
    redirect("/sign-in")
  }

  return result
}
