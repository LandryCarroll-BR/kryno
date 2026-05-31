import { Effect, Layer } from "effect"

import { makeKrynoLocalApiServerLive } from "./local-api-server.ts"

makeKrynoLocalApiServerLive.pipe(
  Effect.flatMap(Layer.launch),
  Effect.runPromise
)

