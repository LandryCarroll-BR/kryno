import { NodeHttpServer } from "@effect/platform-node"
import { AuthTestLayer } from "@workspace/auth/testing"
import { Config, Effect, Layer } from "effect"
import { HttpRouter } from "effect/unstable/http"
import { createServer } from "node:http"

import { KrynoApiRoutes } from "./kryno-api-app.ts"

export const DEFAULT_LOCAL_API_HOSTNAME = "127.0.0.1"
export const DEFAULT_LOCAL_API_PORT = 4000

export interface LocalApiServerOptions {
  readonly hostname?: string
  readonly port?: number
  readonly disableListenLog?: boolean
}

export const readLocalApiServerOptions = Effect.gen(function* () {
  const port = yield* Config.int("PORT").pipe(
    Config.orElse(() => Config.succeed(DEFAULT_LOCAL_API_PORT))
  )

  return {
    hostname: DEFAULT_LOCAL_API_HOSTNAME,
    port,
  } satisfies Required<Pick<LocalApiServerOptions, "hostname" | "port">>
})

export const makeKrynoLocalApiServerLayer = (
  options: LocalApiServerOptions = {}
) => {
  const hostname = options.hostname ?? DEFAULT_LOCAL_API_HOSTNAME
  const port = options.port ?? DEFAULT_LOCAL_API_PORT
  const serveOptions =
    options.disableListenLog === undefined
      ? { disableLogger: true }
      : { disableLogger: true, disableListenLog: options.disableListenLog }

  return HttpRouter.serve(KrynoApiRoutes, serveOptions).pipe(
    Layer.provide(AuthTestLayer),
    Layer.provideMerge(
      NodeHttpServer.layer(createServer, {
        host: hostname,
        port,
      })
    )
  )
}

export const makeKrynoLocalApiServerLive = Effect.map(
  readLocalApiServerOptions,
  makeKrynoLocalApiServerLayer
)
