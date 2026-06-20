"use server"

import { Effect } from "effect"
import { SIGN_IN_REDIRECT_PATH } from "@/config/constants"
import { SignInController, SignInViewModel } from "@auth/adapters-next"
import { AuthAdapterTestRuntime } from "@auth/adapters-next/test"

export async function signIn(
  redirectUrl: string | undefined,
  previousState: SignInViewModel,
  formData: FormData
): Promise<SignInViewModel> {
  return AuthAdapterTestRuntime.runPromise(
    SignInController({
      previousState,
      formData,
      redirectUrl: redirectUrl || SIGN_IN_REDIRECT_PATH,
    }).pipe(Effect.flatMap(({ handle }) => handle()))
  )
}
