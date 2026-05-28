import { describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit } from "effect"

import { SystemAdminBootstrap } from "../src/application/system-admin-bootstrap/system-admin-bootstrap-input-boundary"
import { AuthApplicationTestLayer } from "../src/layers/test-layer"

describe("SystemAdminBootstrap.bootstrapFirstAdmin", () => {
  it.effect("creates the first system admin with password credentials", () =>
    Effect.gen(function* () {
      const bootstrap = yield* SystemAdminBootstrap

      const result = yield* bootstrap.bootstrapFirstAdmin({
        email: "admin@example.com",
        password: "correct horse battery staple",
      })

      expect(result._tag).toBe("FirstSystemAdminCreated")
      if (result._tag !== "FirstSystemAdminCreated") {
        throw new Error("expected first bootstrap to create an admin")
      }
      expect(result.admin.id).toBe("system-admin-1")
      expect(result.admin.email).toBe("admin@example.com")
      expect(result.credential.adminId).toBe(result.admin.id)
      expect(result.credential.passwordHash).toBe(
        "hashed:correct horse battery staple"
      )
    }).pipe(Effect.provide(AuthApplicationTestLayer))
  )

  it.effect(
    "returns the existing first admin when run again with the same email",
    () =>
      Effect.gen(function* () {
        const bootstrap = yield* SystemAdminBootstrap

        const first = yield* bootstrap.bootstrapFirstAdmin({
          email: "admin@example.com",
          password: "first password",
        })
        const second = yield* bootstrap.bootstrapFirstAdmin({
          email: "admin@example.com",
          password: "ignored replacement password",
        })

        expect(first._tag).toBe("FirstSystemAdminCreated")
        if (first._tag !== "FirstSystemAdminCreated") {
          throw new Error("expected first bootstrap to create an admin")
        }
        expect(second._tag).toBe("FirstSystemAdminAlreadyBootstrapped")
        expect(second.admin.id).toBe(first.admin.id)
        expect(second.admin.email).toBe("admin@example.com")
      }).pipe(Effect.provide(AuthApplicationTestLayer))
  )

  it.effect(
    "rejects bootstrap for a different email after the first admin exists",
    () =>
      Effect.gen(function* () {
        const bootstrap = yield* SystemAdminBootstrap

        const first = yield* bootstrap.bootstrapFirstAdmin({
          email: "admin@example.com",
          password: "first password",
        })

        const duplicate = yield* Effect.exit(
          bootstrap.bootstrapFirstAdmin({
            email: "other-admin@example.com",
            password: "second password",
          })
        )

        expect(Exit.isFailure(duplicate)).toBe(true)
        if (Exit.isFailure(duplicate)) {
          const failure = duplicate.cause.reasons.find(Cause.isFailReason)
          expect(failure).toBeDefined()
          if (failure !== undefined) {
            expect(failure.error._tag).toBe(
              "FirstSystemAdminAlreadyExists"
            )
            expect(failure.error.existingAdminId).toBe(first.admin.id)
            expect(failure.error.requestedEmail).toBe(
              "other-admin@example.com"
            )
          }
        }
      }).pipe(Effect.provide(AuthApplicationTestLayer))
  )
})
