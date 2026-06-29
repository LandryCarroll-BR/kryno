"use server"

import "server-only"
import { Effect } from "effect"
import { revalidatePath } from "next/cache"

import { ClimbingAdapterRuntime } from "@climbing/adapters-next"
import { LogBoulderAttemptViewModel } from "@climbing/adapters-next/presenters/log-boulder-attempt"
import { LogBoulderAttemptController } from "@climbing/adapters-next/controllers/log-boulder-attempt"

export async function logBoulderAttempt(
  previousState: LogBoulderAttemptViewModel,
  formData: FormData
) {
  const result = await ClimbingAdapterRuntime.runPromise(
    LogBoulderAttemptController({
      previousState,
      redirectUrl: "/sign-in",
    }).pipe(Effect.flatMap(({ handle }) => handle(formData)))
  )

  if (result.status === "success") {
    revalidatePath("/dashboard")
  }

  return result
}
