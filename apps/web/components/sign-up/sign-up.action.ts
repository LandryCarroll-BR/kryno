"use server"

import { SIGN_UP_REDIRECT_PATH } from "@/config/constants"
import {
  AuthRuntime,
  SignUpController,
  SignUpViewModel,
} from "@auth/adapters-next"

import { Effect } from "effect"

export async function signUp(
  redirectUrl: string | undefined,
  previousState: SignUpViewModel,
  formData: FormData
): Promise<SignUpViewModel> {
  return AuthRuntime.runPromise(
    SignUpController({
      previousState,
      formData,
      redirectUrl: redirectUrl || SIGN_UP_REDIRECT_PATH,
    }).pipe(Effect.flatMap(({ handle }) => handle()))
  )
}
