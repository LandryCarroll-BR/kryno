import { HttpApiBuilder } from "effect/unstable/httpapi"
import { KrynoHttpApi } from "./kryno-http-api.ts"
import { buildAuthHttpHandlers } from "@workspace/auth/api/auth-handlers"

export const KrynoAuthHttpHandlersLive = HttpApiBuilder.group(
  KrynoHttpApi,
  "auth",
  buildAuthHttpHandlers
)

export const KrynoHttpHandlersLive = KrynoAuthHttpHandlersLive
