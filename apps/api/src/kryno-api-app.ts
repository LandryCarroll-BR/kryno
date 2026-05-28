import { KrynoHttpApi, KrynoHttpHandlersLive } from "@workspace/api"
import { AuthTestLayer } from "@workspace/auth/testing"
import { Layer } from "effect"
import { HttpRouter, HttpServer } from "effect/unstable/http"
import { HttpApiBuilder } from "effect/unstable/httpapi"

export const KrynoApiRoutes = HttpApiBuilder.layer(KrynoHttpApi).pipe(
  Layer.provide(KrynoHttpHandlersLive.pipe(Layer.provide(AuthTestLayer)))
)

export const KrynoApiWebHandler = HttpRouter.toWebHandler(
  KrynoApiRoutes.pipe(Layer.provide(HttpServer.layerServices)),
  { disableLogger: true }
)
