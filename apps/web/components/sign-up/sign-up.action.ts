"use server"

import { Effect } from "effect"
import { SIGN_UP_REDIRECT_PATH } from "@/config/constants"
import { SignUpController, SignUpViewModel } from "@auth/adapters-next"
import { AuthAdapterTestRuntime } from "@auth/adapters-next/test"

export async function signUp(
  redirectUrl: string | undefined,
  previousState: SignUpViewModel,
  formData: FormData
): Promise<SignUpViewModel> {
  return AuthAdapterTestRuntime.runPromise(
    SignUpController({
      previousState,
      formData,
      redirectUrl: redirectUrl || SIGN_UP_REDIRECT_PATH,
    }).pipe(Effect.flatMap(({ handle }) => handle()))
  )
}
