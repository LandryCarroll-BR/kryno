import { KrynoHttpApi } from "@workspace/api/kryno-http-api"
import {
  LoginGymUserInput as AuthLoginGymUserInput,
  SignUpGymUserInput as AuthSignUpGymUserInput,
  VerifyGymUserEmailInput as AuthVerifyGymUserEmailInput,
} from "@workspace/auth/domain/gym-user"
import { Effect } from "effect"
import { Cookies, FetchHttpClient } from "effect/unstable/http"
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

export interface KrynoApiResponse {
  readonly setCookieHeaders: readonly string[]
}

export interface KrynoApiClient {
  readonly signUpGymUser: (input: GymUserSignupInput) => Promise<unknown>
  readonly verifyGymUserEmail: (
    input: VerifyGymUserEmailInput
  ) => Promise<unknown>
  readonly loginGymUser: (
    input: LoginGymUserInput
  ) => Promise<KrynoApiResponse>
}

const getKrynoApiBaseUrl = (request: Request) =>
  process.env.KRYNO_API_BASE_URL ?? new URL(request.url).origin

export const getKrynoApiClient = async (
  request: Request
): Promise<KrynoApiClient> => {
  const client = await HttpApiClient.make(KrynoHttpApi, {
    baseUrl: getKrynoApiBaseUrl(request),
  }).pipe(Effect.provide(FetchHttpClient.layer), Effect.runPromise)

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
      const [, response] = await client.auth
        .loginGymUser({
          payload: new AuthLoginGymUserInput(input),
          responseMode: "decoded-and-response",
        })
        .pipe(Effect.runPromise)

      return {
        setCookieHeaders: Cookies.toSetCookieHeaders(response.cookies),
      }
    },
  }
}
