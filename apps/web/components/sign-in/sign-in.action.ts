"use server"

import { SIGN_IN_REDIRECT_PATH } from "@/config/constants"
import {
  AuthRuntime,
  SignInController,
  SignInViewModel,
} from "@auth/adapters-next"

import { Effect } from "effect"

export async function signIn(
  redirectUrl: string | undefined,
  previousState: SignInViewModel,
  formData: FormData
): Promise<SignInViewModel> {
  return AuthRuntime.runPromise(
    SignInController({
      previousState,
      formData,
      redirectUrl: redirectUrl || SIGN_IN_REDIRECT_PATH,
    }).pipe(Effect.flatMap(({ handle }) => handle()))
  )
}
