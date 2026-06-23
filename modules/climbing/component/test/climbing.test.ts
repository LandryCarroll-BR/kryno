import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

import { Climbing } from "../src/index"
import { ClimbingTestLayer } from "./index"

describe("Climbing", () => {
  it.effect("starts a climbing session through the component facade", () =>
    Effect.gen(function* () {
      const climbing = yield* Climbing
      const session = yield* climbing.startClimbingSession({
        token: "valid-token",
      })

      expect(session.climberId).toBe("climber-1")
    }).pipe(Effect.provide(ClimbingTestLayer))
  )
})
