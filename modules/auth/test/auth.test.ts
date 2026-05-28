import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

import { Auth } from "@workspace/auth"
import { AuthTestLayer } from "../src/layers/test-layer"
import { AuthMock } from "../src/layers/mock-layer"

describe("Auth", () => {
  it.effect("can be provided by the live application test layer", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      const reservation = yield* auth.reserveGymUserEmail({
        email: "alex@example.com",
        displayName: "Alex",
      })

      expect(reservation.id).toBe("gym-user-1")
      expect(reservation.email).toBe("alex@example.com")
    }).pipe(Effect.provide(AuthTestLayer))
  )

  it.effect("can be provided by a mock layer", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      const reservation = yield* auth.reserveGymUserEmail({
        email: "mock@example.com",
        displayName: "Mock User",
      })

      expect(reservation.id).toBe("gym-user-mock")
      expect(reservation.email).toBe("mock@example.com")
    }).pipe(Effect.provide(AuthMock))
  )
})
