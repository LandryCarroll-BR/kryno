"use server"

import { Effect } from "effect"
import { SIGN_OUT_REDIRECT_PATH } from "@/config/constants"
import { SignOutController } from "@auth/adapters-next"
import { AuthAdapterRuntime } from "@auth/adapters-next"

export async function signOut(redirectUrl: string | undefined) {
  return AuthAdapterRuntime.runPromise(
    SignOutController({
      redirectUrl: redirectUrl || SIGN_OUT_REDIRECT_PATH,
    }).pipe(Effect.flatMap(({ handle }) => handle()))
  )
}
