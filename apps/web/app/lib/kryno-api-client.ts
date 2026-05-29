import { KrynoHttpApi } from "@workspace/api/kryno-http-api"
import { Effect } from "effect"
import { FetchHttpClient } from "effect/unstable/http"
import { HttpApiClient } from "effect/unstable/httpapi"

export interface GymUserSignupInput {
  readonly email: string
  readonly password: string
  readonly displayName: string
}

export interface VerifyGymUserEmailInput {
  readonly token: string
}

export interface KrynoApiClient {
  readonly signUpGymUser: (
    input: GymUserSignupInput
  ) => Promise<unknown>
  readonly verifyGymUserEmail: (
    input: VerifyGymUserEmailInput
  ) => Promise<unknown>
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
      client.auth.signUpGymUser({ payload: input }).pipe(Effect.runPromise),
    verifyGymUserEmail: (input) =>
      client.auth.verifyGymUserEmail({ payload: input }).pipe(Effect.runPromise),
  }
}
