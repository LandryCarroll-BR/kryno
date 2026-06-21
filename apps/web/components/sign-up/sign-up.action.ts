"use server"

import { Effect } from "effect"
import { SIGN_UP_REDIRECT_PATH } from "@/config/constants"
import { SignUpController, SignUpViewModel } from "@auth/adapters-next"
import { AuthAdapterRuntime } from "@auth/adapters-next"

export async function signUp(
  redirectUrl: string | undefined,
  previousState: SignUpViewModel,
  formData: FormData
) {
  return AuthAdapterRuntime.runPromise(
    SignUpController({
      previousState,
      formData,
      redirectUrl: redirectUrl || SIGN_UP_REDIRECT_PATH,
    }).pipe(Effect.flatMap(({ handle }) => handle()))
  )
}
