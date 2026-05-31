import { redirect } from "react-router"
import { Effect } from "effect"
import {
  getKrynoApiClient,
  type KrynoApiClient,
  type KrynoApiClientGetter,
  type KrynoApiEffect,
} from "../../../lib/kryno-api/kryno-api-client"
import { serializeGymUserSessionCookie } from "../../../lib/kryno-api/gym-user-session-cookie"
import {
  failureMessages,
  type FieldName,
  type LoginActionData,
} from "../../../features/auth/login/gym-user-login-view-model"

type LoginGymUserRequest = Parameters<KrynoApiClient["auth"]["loginGymUser"]>[0]

type GymUserLoginApiClient = {
  readonly auth: {
    readonly loginGymUser: (
      request: LoginGymUserRequest
    ) => KrynoApiEffect<LoginSuccess>
  }
}

interface LoginSuccess {
  readonly session: {
    readonly id: string
  }
}

export type GymUserLoginAction = ({
  request,
}: {
  request: Request
}) => Promise<Response | LoginActionData>

export const createGymUserLoginAction =
  (getClient: KrynoApiClientGetter<GymUserLoginApiClient>) =>
  async ({
    request,
  }: {
    request: Request
  }): Promise<Response | LoginActionData> => {
    const formData = await request.formData()
    const input = {
      email: readFormString(formData, "email").toLowerCase(),
      password: readFormString(formData, "password"),
    }
    const fieldErrors = validateLogin(input)

    if (Object.keys(fieldErrors).length > 0) {
      return {
        status: "error",
        formError: failureMessages.invalidInput,
        fieldErrors,
      }
    }

    const client = await getClient()

    return await client.auth.loginGymUser({ payload: input }).pipe(
      Effect.andThen((response) =>
        Effect.succeed(
          redirectToAppWithSessionCookie(response.session.id, request)
        )
      ),
      Effect.catchTags({
        GymUserInvalidCredentials: () =>
          Effect.succeed(loginActionError(failureMessages.invalidCredentials)),
        GymUserUnverified: () =>
          Effect.succeed(loginActionError(failureMessages.unverified)),
        HttpClientError: () =>
          Effect.succeed(loginActionError(failureMessages.unknown)),
        SchemaError: () =>
          Effect.succeed(loginActionError(failureMessages.invalidInput)),
      }),
      Effect.runPromise
    )
  }

export const gymUserLoginAction: GymUserLoginAction =
  createGymUserLoginAction(getKrynoApiClient)

const loginActionError = (
  formError: string,
  fieldErrors: LoginActionData["fieldErrors"] = {}
): LoginActionData => ({
  status: "error",
  formError,
  fieldErrors,
})

const readFormString = (formData: FormData, name: FieldName) => {
  const value = formData.get(name)
  return typeof value === "string" ? value.trim() : ""
}

const validateLogin = (input: Record<FieldName, string>) => {
  const fieldErrors: Partial<Record<FieldName, string>> = {}

  if (!input.email) {
    fieldErrors.email = "Enter your email."
  } else if (!input.email.includes("@")) {
    fieldErrors.email = "Enter a valid email."
  }

  if (!input.password) {
    fieldErrors.password = "Enter your password."
  }

  return fieldErrors
}

const redirectToAppWithSessionCookie = (
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
