import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { GymIdService } from "@gym/application/services/gym-id"

import { GymIdServiceTest } from "./services/gym-id-test.service"

describe("GymIdServiceTest.generate", () => {
  it.effect("generates deterministic, distinct ids", () =>
    Effect.gen(function* () {
      const gymIdService = yield* GymIdService

      expect(yield* gymIdService.generate()).toBe("gym-1")
      expect(yield* gymIdService.generate()).toBe("gym-2")
    }).pipe(Effect.provide(GymIdServiceTest))
  )
})
