import { redirect } from "react-router"
import { Effect } from "effect"

import {
  getKrynoApiClient,
  type KrynoApiEffect,
} from "../../../lib/kryno-api/kryno-api-client"
import {
  ManualEmailVerificationActionViewModel,
  type ManualEmailVerificationActionData,
} from "../../../features/auth/manual-email-verification/manual-email-verification-view-model"

export interface ManualEmailVerificationInput {
  readonly token: string
}

export interface ManualEmailVerificationActionDependencies {
  readonly verifyGymUserEmail: (
    input: ManualEmailVerificationInput
  ) => Promise<KrynoApiEffect> | KrynoApiEffect
  readonly redirectToLogin: () => Response
}

export type ManualEmailVerificationAction = ({
  request,
}: {
  request: Request
}) => Promise<Response | ManualEmailVerificationActionData>

export const createManualEmailVerificationAction =
  ({
    verifyGymUserEmail,
    redirectToLogin,
  }: ManualEmailVerificationActionDependencies) =>
  async ({
    request,
  }: {
    request: Request
  }): Promise<Response | ManualEmailVerificationActionData> => {
    const ViewModel = ManualEmailVerificationActionViewModel
    const formData = await request.formData()

    const input: ManualEmailVerificationInput = {
      token: ViewModel.readFormString(formData, "token"),
    }

    const fieldErrors = ViewModel.validate(input)

    if (Object.keys(fieldErrors).length > 0) {
      return ViewModel.toError(
        ViewModel.failureMessages.invalidInput,
        fieldErrors
      )
    }

    const verificationEffect = await verifyGymUserEmail(input)

    return await verificationEffect.pipe(
      Effect.andThen(() => {
        return Effect.succeed(redirectToLogin())
      }),
      Effect.catchTags({
        GymUserEmailVerificationInvalid: () => {
          return Effect.succeed(
            ViewModel.toError(ViewModel.failureMessages.invalidToken, {
              token: ViewModel.failureMessages.invalidToken,
            })
          )
        },
        GymUserNotFound: () => {
          return Effect.succeed(
            ViewModel.toError(ViewModel.failureMessages.invalidToken, {
              token: ViewModel.failureMessages.invalidToken,
            })
          )
        },
      }),
      Effect.runPromise
    )
  }

export const redirectToLogin = () => redirect("/login")

export const manualEmailVerificationAction: ManualEmailVerificationAction =
  createManualEmailVerificationAction({
    verifyGymUserEmail: async (input) => {
      const client = await getKrynoApiClient()
      return client.auth.verifyGymUserEmail({ payload: input })
    },
    redirectToLogin,
  })
