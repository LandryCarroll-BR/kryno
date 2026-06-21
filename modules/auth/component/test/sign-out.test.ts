import { describe, expect, it, vi } from "vitest"
import { Effect, Layer, Option } from "effect"
import {
  SignInUseCase,
  SignOutUseCase,
  SignUpUseCase,
  ValidateSessionUseCase,
} from "@auth/application"

import { Auth } from "../src/index"

describe("Auth.signOut", () => {
  it("forwards the full session token to the sign-out use case", async () => {
    const execute = vi.fn(() => Effect.void)
    const useCases = Layer.mergeAll(
      Layer.succeed(SignInUseCase, {
        execute: () => Effect.die("unused"),
      }),
      Layer.succeed(SignOutUseCase, { execute }),
      Layer.succeed(SignUpUseCase, {
        execute: () => Effect.die("unused"),
      }),
      Layer.succeed(ValidateSessionUseCase, {
        execute: () => Effect.succeed(Option.none()),
      })
    )
    const token = `${"a".repeat(24)}.${"s".repeat(24)}`

    await Effect.runPromise(
      Effect.gen(function* () {
        const auth = yield* Auth
        yield* auth.signOut({ token })
      }).pipe(Effect.provide(Auth.Live.pipe(Layer.provide(useCases))))
    )

    expect(execute).toHaveBeenCalledWith({ token })
  })
})
