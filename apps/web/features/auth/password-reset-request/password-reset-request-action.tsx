import { Effect } from "effect"

import {
  getKrynoApiClient,
  type KrynoApiEffect,
} from "../../../lib/kryno-api/kryno-api-client"
import {
  PasswordResetRequestViewModel,
  type PasswordResetRequestActionData,
} from "../../../features/auth/password-reset-request/password-reset-request-view-model"

export interface PasswordResetRequestInput {
  readonly email: string
}

export interface PasswordResetRequestActionDependencies {
  readonly requestGymUserPasswordReset: (
    input: PasswordResetRequestInput
  ) => Promise<KrynoApiEffect> | KrynoApiEffect
}

export type PasswordResetRequestAction = ({
  request,
}: {
  request: Request
}) => Promise<PasswordResetRequestActionData>

export const createPasswordResetRequestAction =
  ({ requestGymUserPasswordReset }: PasswordResetRequestActionDependencies) =>
  async ({
    request,
  }: {
    request: Request
  }): Promise<PasswordResetRequestActionData> => {
    const ViewModel = PasswordResetRequestViewModel
    const formData = await request.formData()

    const input: PasswordResetRequestInput = {
      email: ViewModel.readFormString(formData, "email").toLowerCase(),
    }

    const fieldErrors = ViewModel.validate(input)

    if (Object.keys(fieldErrors).length > 0) {
      return ViewModel.toError(
        ViewModel.failureMessages.invalidInput,
        fieldErrors
      )
    }

    const resetEffect = await requestGymUserPasswordReset(input)

    return await resetEffect.pipe(
      Effect.andThen(() => Effect.succeed(ViewModel.toSuccess())),
      Effect.catch((error) => {
        if (isPasswordResetUnknownEmail(error)) {
          return Effect.succeed(ViewModel.toSuccess())
        }

        return Effect.fail(error)
      }),
      Effect.runPromise
    )
  }

const isPasswordResetUnknownEmail = (
  error: unknown
): error is { readonly _tag: "GymUserPasswordResetUnknownEmail" } =>
  typeof error === "object" &&
  error !== null &&
  "_tag" in error &&
  error._tag === "GymUserPasswordResetUnknownEmail"

export const passwordResetRequestAction: PasswordResetRequestAction =
  createPasswordResetRequestAction({
    requestGymUserPasswordReset: async (input) => {
      const client = await getKrynoApiClient()
      return client.auth.requestGymUserPasswordReset({ payload: input })
    },
  })
