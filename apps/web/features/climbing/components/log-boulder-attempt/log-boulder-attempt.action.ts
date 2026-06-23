"use server"

import "server-only"
import { Effect } from "effect"
import { revalidatePath } from "next/cache"

import {
  ClimbingAdapterRuntime,
  LogBoulderAttemptController,
  type LogBoulderAttemptViewModel,
} from "@climbing/adapters-next"

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
