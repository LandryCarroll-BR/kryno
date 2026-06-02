import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, Redacted } from "effect"

import { AuthIdGeneratorCryptoAdapter } from "../src/adapters/services/auth-id-generator-crypto"
import { AuthTokenDigesterHmacAdapter } from "../src/adapters/services/auth-token-digester-hmac"
import { AuthTokenGeneratorCryptoAdapter } from "../src/adapters/services/auth-token-generator-crypto"
import { makePasswordHasherArgon2idAdapter } from "../src/adapters/services/password-hasher-argon2id"
import { normalizeEmailIdentity } from "../src/domain/email-identity"
import { AuthIdGenerator } from "../src/ports/services/auth-id-generator"
import { AuthSecret } from "../src/ports/services/auth-secret"
import { AuthTokenDigester } from "../src/ports/services/auth-token-digester"
import { AuthTokenGenerator } from "../src/ports/services/auth-token-generator"
import { PasswordHasher } from "../src/ports/services/password-hasher"

const AuthSecretTestLayer = Layer.succeed(AuthSecret, {
  value: Redacted.make("test-auth-secret-with-enough-entropy"),
})
const PasswordHasherArgon2idFastTestAdapter = makePasswordHasherArgon2idAdapter({
  memory: 1024,
  parallelism: 1,
  passes: 1,
  tagLength: 32,
})

describe("secure auth primitives", () => {
  it.effect("hashes and verifies passwords with Argon2id-shaped hashes", () =>
    Effect.gen(function* () {
      const hasher = yield* PasswordHasher

      const hash = yield* hasher.hashPassword("correct horse battery staple")

      expect(hash).toMatch(
        /^\$kryno-argon2id\$m=1024,t=1,p=1\$[A-Za-z0-9_-]{22}\$[A-Za-z0-9_-]{43}$/
      )
      expect(hash).not.toContain("correct horse battery staple")
      expect(
        yield* hasher.verifyPassword("correct horse battery staple", hash)
      ).toBe(true)
      expect(yield* hasher.verifyPassword("wrong password", hash)).toBe(false)
    }).pipe(Effect.provide(PasswordHasherArgon2idFastTestAdapter))
  )

  it.effect("generates UUID identifiers with crypto randomness", () =>
    Effect.gen(function* () {
      const ids = yield* AuthIdGenerator

      const userId = yield* ids.nextGymUserId
      const sessionId = yield* ids.nextGymUserSessionId

      expect(userId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      )
      expect(sessionId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      )
      expect(sessionId).not.toBe(userId)
    }).pipe(Effect.provide(AuthIdGeneratorCryptoAdapter))
  )

  it.effect("generates opaque bearer tokens without deterministic prefixes", () =>
    Effect.gen(function* () {
      const tokens = yield* AuthTokenGenerator

      const first = yield* tokens.nextGymUserEmailVerificationToken
      const second = yield* tokens.nextGymUserEmailVerificationToken

      expect(first).toMatch(/^[A-Za-z0-9_-]{43}$/)
      expect(second).toMatch(/^[A-Za-z0-9_-]{43}$/)
      expect(first).not.toBe(second)
      expect(first).not.toContain("gym-user-email-verification-token")
    }).pipe(Effect.provide(AuthTokenGeneratorCryptoAdapter))
  )

  it.effect("digests tokens with stable HMAC-SHA-256 output", () =>
    Effect.gen(function* () {
      const digester = yield* AuthTokenDigester

      const first = yield* digester.digestToken("raw-bearer-token")
      const second = yield* digester.digestToken("raw-bearer-token")
      const different = yield* digester.digestToken("other-token")

      expect(first).toMatch(/^[A-Za-z0-9_-]{43}$/)
      expect(first).toBe(second)
      expect(first).not.toBe(different)
      expect(first).not.toContain("raw-bearer-token")
    }).pipe(
      Effect.provide(
        AuthTokenDigesterHmacAdapter.pipe(Layer.provide(AuthSecretTestLayer))
      )
    )
  )

  it("normalizes email identity for case-insensitive lookup keys", () => {
    expect(normalizeEmailIdentity("  Alex.Member+Owner@Example.COM  ")).toBe(
      "alex.member+owner@example.com"
    )
  })
})
