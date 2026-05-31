import { KrynoHttpApi } from "@workspace/api/kryno-http-api"
import { Effect } from "effect"
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "effect/unstable/http"
import { HttpApiClient } from "effect/unstable/httpapi"

export interface KrynoApiClientOptions {
  readonly sessionId?: string
}

const getKrynoApiBaseUrl = () => {
  const baseUrl = process.env.KRYNO_API_BASE_URL?.trim()

  if (!baseUrl) {
    throw new Error("KRYNO_API_BASE_URL must be configured")
  }

  return baseUrl
}

const makeKrynoApiClientEffect = (options: KrynoApiClientOptions = {}) =>
  HttpApiClient.make(KrynoHttpApi, {
    baseUrl: getKrynoApiBaseUrl(),
    ...(options.sessionId === undefined
      ? {}
      : {
          transformClient: HttpClient.mapRequest(
            HttpClientRequest.bearerToken(options.sessionId)
          ),
        }),
  })

export type KrynoApiClient = Effect.Success<
  ReturnType<typeof makeKrynoApiClientEffect>
>

export type KrynoApiEffect<A = unknown> = Effect.Effect<A, unknown>

export type KrynoApiClientGetter<TClient = KrynoApiClient> = (
  options?: KrynoApiClientOptions
) => Promise<TClient>

export const getKrynoApiClient: KrynoApiClientGetter = async (options) =>
  makeKrynoApiClientEffect(options).pipe(
    Effect.provide(FetchHttpClient.layer),
    Effect.runPromise
  )
