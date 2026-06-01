import { redirect } from "react-router"
import { Effect } from "effect"

import {
  getKrynoApiClient,
  type KrynoApiEffect,
} from "../../../lib/kryno-api/kryno-api-client"
import {
  PasswordResetCompletionViewModel,
  type PasswordResetCompletionActionData,
} from "../../../features/auth/password-reset-completion/password-reset-completion-view-model"

export interface PasswordResetCompletionInput {
  readonly token: string
  readonly newPassword: string
}

export interface PasswordResetCompletionActionDependencies {
  readonly completeGymUserPasswordReset: (
    input: PasswordResetCompletionInput
  ) => Promise<KrynoApiEffect> | KrynoApiEffect
  readonly redirectToLogin: () => Response
}

export type PasswordResetCompletionAction = ({
  request,
}: {
  request: Request
}) => Promise<Response | PasswordResetCompletionActionData>

export const createPasswordResetCompletionAction =
  ({
    completeGymUserPasswordReset,
    redirectToLogin,
  }: PasswordResetCompletionActionDependencies) =>
  async ({
    request,
  }: {
    request: Request
  }): Promise<Response | PasswordResetCompletionActionData> => {
    const ViewModel = PasswordResetCompletionViewModel
    const formData = await request.formData()

    const input: PasswordResetCompletionInput = {
      token: ViewModel.readFormString(formData, "token"),
      newPassword: ViewModel.readFormString(formData, "newPassword"),
    }

    const fieldErrors = ViewModel.validate(input)

    if (Object.keys(fieldErrors).length > 0) {
      return ViewModel.toError(
        ViewModel.failureMessages.invalidInput,
        fieldErrors
      )
    }

    const completionEffect = await completeGymUserPasswordReset(input)

    return await completionEffect.pipe(
      Effect.andThen(() => Effect.succeed(redirectToLogin())),
      Effect.catchTags({
        GymUserPasswordResetTokenInvalid: () => {
          return Effect.succeed(
            ViewModel.toError(ViewModel.failureMessages.invalidToken, {
              token: ViewModel.failureMessages.invalidToken,
            })
          )
        },
        GymUserPasswordResetTokenExpired: () => {
          return Effect.succeed(
            ViewModel.toError(ViewModel.failureMessages.expiredToken, {
              token: ViewModel.failureMessages.expiredToken,
            })
          )
        },
        GymUserPasswordResetTokenAlreadyUsed: () => {
          return Effect.succeed(
            ViewModel.toError(ViewModel.failureMessages.usedToken, {
              token: ViewModel.failureMessages.usedToken,
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

export const redirectToLoginAfterPasswordReset = () =>
  redirect("/login?status=password-reset-complete")

export const passwordResetCompletionAction: PasswordResetCompletionAction =
  createPasswordResetCompletionAction({
    completeGymUserPasswordReset: async (input) => {
      const client = await getKrynoApiClient()
      return client.auth.completeGymUserPasswordReset({ payload: input })
    },
    redirectToLogin: redirectToLoginAfterPasswordReset,
  })
