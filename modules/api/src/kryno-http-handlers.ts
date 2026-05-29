import { Layer } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { AuthSessionTransportRequiredLive } from "@workspace/auth/api/auth-authorization"
import { buildAuthHttpHandlers } from "@workspace/auth/api/auth-handlers"
import { KrynoHttpApi } from "./kryno-http-api.ts"

export const KrynoAuthHttpHandlersLive = HttpApiBuilder.group(
  KrynoHttpApi,
  "auth",
  buildAuthHttpHandlers
)

export const KrynoHttpHandlersLive = KrynoAuthHttpHandlersLive.pipe(
  Layer.provide(AuthSessionTransportRequiredLive)
)
