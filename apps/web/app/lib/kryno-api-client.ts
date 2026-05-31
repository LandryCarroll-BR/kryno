import { KrynoHttpApi } from "@workspace/api/kryno-http-api"
import {
  CurrentGymUserSessionSuccess as AuthCurrentGymUserSessionSuccess,
  LoginGymUserInput as AuthLoginGymUserInput,
  SignUpGymUserInput as AuthSignUpGymUserInput,
  VerifyGymUserEmailInput as AuthVerifyGymUserEmailInput,
} from "@workspace/auth/domain/gym-user"
import { Effect } from "effect"
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "effect/unstable/http"
import { HttpApiClient } from "effect/unstable/httpapi"

export interface GymUserSignupInput {
  readonly email: string
  readonly password: string
  readonly displayName: string
}

export interface VerifyGymUserEmailInput {
  readonly token: string
}

export interface LoginGymUserInput {
  readonly email: string
  readonly password: string
}

export interface LoginGymUserSession {
  readonly user: {
    readonly id: string
    readonly email: string
    readonly displayName: string
    readonly emailVerified: boolean
  }
  readonly session: {
    readonly id: string
    readonly userId: string
    readonly active: boolean
  }
}

export interface CurrentGymUserSession {
  readonly user: LoginGymUserSession["user"]
  readonly session: LoginGymUserSession["session"]
  readonly activeAffiliations: readonly unknown[]
}

export interface KrynoApiClient {
  readonly signUpGymUser: (input: GymUserSignupInput) => Promise<unknown>
  readonly verifyGymUserEmail: (
    input: VerifyGymUserEmailInput
  ) => Promise<unknown>
  readonly loginGymUser: (
    input: LoginGymUserInput
  ) => Promise<LoginGymUserSession>
  readonly currentGymUserSession: (
    sessionId: string
  ) => Promise<CurrentGymUserSession>
}

const getKrynoApiBaseUrl = (request: Request) =>
  process.env.KRYNO_API_BASE_URL ?? new URL(request.url).origin

const makeHttpApiClient = (request: Request, sessionId?: string) =>
  HttpApiClient.make(KrynoHttpApi, {
    baseUrl: getKrynoApiBaseUrl(request),
    ...(sessionId === undefined
      ? {}
      : {
          transformClient: HttpClient.mapRequest(
            HttpClientRequest.bearerToken(sessionId)
          ),
        }),
  }).pipe(Effect.provide(FetchHttpClient.layer), Effect.runPromise)

export const getKrynoApiClient = async (
  request: Request
): Promise<KrynoApiClient> => {
  const client = await makeHttpApiClient(request)

  return {
    signUpGymUser: (input) =>
      client.auth
        .signUpGymUser({ payload: new AuthSignUpGymUserInput(input) })
        .pipe(Effect.runPromise),
    verifyGymUserEmail: (input) =>
      client.auth
        .verifyGymUserEmail({
          payload: new AuthVerifyGymUserEmailInput(input),
        })
        .pipe(Effect.runPromise),
    loginGymUser: async (input) => {
      const [login] = await client.auth
        .loginGymUser({
          payload: new AuthLoginGymUserInput(input),
          responseMode: "decoded-and-response",
        })
        .pipe(Effect.runPromise)

      return login
    },
    currentGymUserSession: async (sessionId) => {
      const authenticatedClient = await makeHttpApiClient(request, sessionId)
      const current = await authenticatedClient.auth
        .currentGymUserSession()
        .pipe(Effect.runPromise)

      return current as AuthCurrentGymUserSessionSuccess
    },
  }
}
