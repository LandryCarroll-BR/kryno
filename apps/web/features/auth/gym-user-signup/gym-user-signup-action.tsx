import { redirect } from "react-router"
import { Effect } from "effect"

import {
  getKrynoApiClient,
  type KrynoApiEffect,
} from "../../../lib/kryno-api/kryno-api-client"
import {
  SignupActionViewModel,
  type SignupActionData,
} from "../../../features/auth/gym-user-signup/gym-user-signup-view-model"

export interface GymUserSignupInput {
  readonly email: string
  readonly password: string
  readonly displayName: string
}

export interface GymUserSignupActionDependencies {
  readonly signUpGymUser: (
    input: GymUserSignupInput
  ) => Promise<KrynoApiEffect> | KrynoApiEffect
  readonly redirectToEmailVerification: (email: string) => Response
}

export type GymUserSignupAction = ({
  request,
}: {
  request: Request
}) => Promise<Response | SignupActionData>

export const createGymUserSignupAction =
  ({
    signUpGymUser,
    redirectToEmailVerification,
  }: GymUserSignupActionDependencies) =>
  async ({
    request,
  }: {
    request: Request
  }): Promise<Response | SignupActionData> => {
    const ViewModel = SignupActionViewModel
    const formData = await request.formData()

    const input: GymUserSignupInput = {
      email: ViewModel.readFormString(formData, "email").toLowerCase(),
      password: ViewModel.readFormString(formData, "password"),
      displayName: ViewModel.readFormString(formData, "displayName"),
    }

    const fieldErrors = ViewModel.validate(input)

    if (Object.keys(fieldErrors).length > 0) {
      return ViewModel.toError(
        ViewModel.failureMessages.invalidInput,
        fieldErrors
      )
    }

    const signupEffect = await signUpGymUser(input)

    return await signupEffect.pipe(
      Effect.andThen(() => {
        return Effect.succeed(redirectToEmailVerification(input.email))
      }),
      Effect.catchTags({
        GymUserEmailAlreadyReserved: () => {
          return Effect.succeed(
            ViewModel.toError(ViewModel.failureMessages.emailReserved, {
              email: ViewModel.failureMessages.emailReserved,
            })
          )
        },
      }),
      Effect.runPromise
    )
  }

export const redirectToEmailVerification = (email: string) =>
  redirect(`/verify-email?email=${encodeURIComponent(email)}`)

export const gymUserSignupAction: GymUserSignupAction =
  createGymUserSignupAction({
    signUpGymUser: async (input) => {
      const client = await getKrynoApiClient()
      return client.auth.signUpGymUser({ payload: input })
    },
    redirectToEmailVerification,
  })
