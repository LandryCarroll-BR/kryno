import { Layer } from "effect"
import { HttpApiBuilder, HttpApiGroup } from "effect/unstable/httpapi"
import {
  type ApiPrefixedAuthHttpGroup,
  buildAuthHttpHandlers,
} from "@workspace/auth/api/auth-handlers"
import { AuthSessionTransportRequiredLive } from "./auth-authorization.ts"
import { KrynoAuthHttpGroup, KrynoHttpApi } from "./kryno-http-api.ts"

const buildKrynoAuthHttpHandlers = (
  handlers: HttpApiBuilder.Handlers.FromGroup<
    HttpApiGroup.AddPrefix<typeof KrynoAuthHttpGroup, "/api">
  >
) =>
  // The composed API adds edge middleware without changing Auth handler request shapes.
  buildAuthHttpHandlers(
    handlers as unknown as HttpApiBuilder.Handlers.FromGroup<ApiPrefixedAuthHttpGroup>
  ) as unknown as HttpApiBuilder.Handlers<any, never>

export const KrynoAuthHttpHandlersLive = HttpApiBuilder.group(
  KrynoHttpApi,
  "auth",
  buildKrynoAuthHttpHandlers
)

export const KrynoHttpHandlersLive = KrynoAuthHttpHandlersLive.pipe(
  Layer.provide(AuthSessionTransportRequiredLive)
)
