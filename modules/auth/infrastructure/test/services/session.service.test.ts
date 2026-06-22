import { Effect } from "effect"
import { describe, expect, it } from "@effect/vitest"

import {
  SessionSecret,
  SessionSecretHash,
  SessionService,
} from "@auth/application"

import { SessionServiceLive } from "../../src/services/session.service"

describe("SessionServiceLive", () => {
  it.effect("verifies a matching session secret", () =>
    Effect.gen(function* () {
      const sessionService = yield* SessionService
      const secret = SessionSecret.make("session-secret")
      const secretHash = yield* sessionService.hashSessionSecret(secret)

      expect(
        yield* sessionService.verifySessionSecret({ secret, secretHash })
      ).toBe(true)
    }).pipe(Effect.provide(SessionServiceLive))
  )

  it.effect("rejects a different session secret", () =>
    Effect.gen(function* () {
      const sessionService = yield* SessionService
      const secretHash = yield* sessionService.hashSessionSecret(
        SessionSecret.make("expected-secret")
      )

      expect(
        yield* sessionService.verifySessionSecret({
          secret: SessionSecret.make("different-secret"),
          secretHash,
        })
      ).toBe(false)
    }).pipe(Effect.provide(SessionServiceLive))
  )

  it.effect("rejects a malformed hash without throwing", () =>
    Effect.gen(function* () {
      const sessionService = yield* SessionService

      expect(
        yield* sessionService.verifySessionSecret({
          secret: SessionSecret.make("session-secret"),
          secretHash: SessionSecretHash.make(new Uint8Array([1, 2, 3])),
        })
      ).toBe(false)
    }).pipe(Effect.provide(SessionServiceLive))
  )
})
