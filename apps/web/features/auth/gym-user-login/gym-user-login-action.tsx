import { redirect } from "react-router"
import { Effect } from "effect"
import {
  getKrynoApiClient,
  type KrynoApiEffect,
} from "../../../lib/kryno-api/kryno-api-client"
import { serializeGymUserSessionCookie } from "../../../lib/kryno-api/gym-user-session-cookie"
import {
  LoginActionViewModel,
  type LoginActionData,
} from "../../../features/auth/gym-user-login/gym-user-login-view-model"

export interface GymUserLoginInput {
  readonly email: string
  readonly password: string
}

export interface GymUserLoginSuccess {
  readonly session: {
    readonly id: string
  }
}

export interface GymUserLoginActionDependencies {
  readonly loginGymUser: (
    input: GymUserLoginInput
  ) =>
    | Promise<KrynoApiEffect<GymUserLoginSuccess>>
    | KrynoApiEffect<GymUserLoginSuccess>
  readonly redirectToAppWithSessionCookie: (
    sessionId: string,
    request: Request
  ) => Response
}

export type GymUserLoginAction = ({
  request,
}: {
  request: Request
}) => Promise<Response | LoginActionData>

export const createGymUserLoginAction =
  ({
    loginGymUser,
    redirectToAppWithSessionCookie,
  }: GymUserLoginActionDependencies) =>
  async ({
    request,
  }: {
    request: Request
  }): Promise<Response | LoginActionData> => {
    const ViewModel = LoginActionViewModel
    const formData = await request.formData()

    const input: GymUserLoginInput = {
      email: ViewModel.readFormString(formData, "email").toLowerCase(),
      password: ViewModel.readFormString(formData, "password"),
    }

    const fieldErrors = ViewModel.validate(input)

    if (Object.keys(fieldErrors).length > 0) {
      return {
        status: "error",
        formError: ViewModel.failureMessages.invalidInput,
        fieldErrors,
      }
    }

    const loginEffect = await loginGymUser(input)

    return await loginEffect.pipe(
      Effect.andThen((response) => {
        return Effect.succeed(
          redirectToAppWithSessionCookie(response.session.id, request)
        )
      }),
      Effect.catchTags({
        GymUserInvalidCredentials: () => {
          return Effect.succeed(
            ViewModel.toError(ViewModel.failureMessages.invalidCredentials)
          )
        },
        GymUserUnverified: () => {
          return Effect.succeed(
            ViewModel.toError(ViewModel.failureMessages.unverified)
          )
        },
        HttpClientError: () => {
          return Effect.succeed(
            ViewModel.toError(ViewModel.failureMessages.unknown)
          )
        },
        SchemaError: () => {
          return Effect.succeed(
            ViewModel.toError(ViewModel.failureMessages.invalidInput)
          )
        },
      }),
      Effect.runPromise
    )
  }

export const redirectToAppWithSessionCookie = (
  sessionId: string,
  request: Request
) => {
  const headers = new Headers()

  headers.append(
    "Set-Cookie",
    serializeGymUserSessionCookie(sessionId, request)
  )

  return redirect("/app", { headers })
}

export const gymUserLoginAction: GymUserLoginAction = createGymUserLoginAction({
  loginGymUser: async (input) => {
    const client = await getKrynoApiClient()
    return client.auth.loginGymUser({ payload: input })
  },
  redirectToAppWithSessionCookie,
})
