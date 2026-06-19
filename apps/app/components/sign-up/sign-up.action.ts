"use server"

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
    SignUpController({ previousState, formData, redirectUrl }).pipe(
      Effect.flatMap(({ handle }) => handle())
    )
  )
}
