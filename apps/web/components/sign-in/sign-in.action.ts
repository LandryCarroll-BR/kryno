"use server"

import { Effect } from "effect"
import { SIGN_IN_REDIRECT_PATH } from "@/config/constants"
import { SignInController, SignInViewModel } from "@auth/adapters-next"
import { AuthAdapterRuntime } from "@auth/adapters-next"

export async function signIn(
  redirectUrl: string | undefined,
  previousState: SignInViewModel,
  formData: FormData
): Promise<SignInViewModel> {
  return AuthAdapterRuntime.runPromise(
    SignInController({
      previousState,
      formData,
      redirectUrl: redirectUrl || SIGN_IN_REDIRECT_PATH,
    }).pipe(Effect.flatMap(({ handle }) => handle()))
  )
}
