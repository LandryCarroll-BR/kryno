import { describe, expect, it } from "@effect/vitest"
import { Effect, Schema } from "effect"

import {
  SignInPresenter,
  type SignInViewModel,
} from "../../src/presenters/sign-in.presenter"
import { SignInControllerInputSchema } from "../../src/controllers/sign-in.controller"

const initialViewModel: SignInViewModel = {
  status: "idle",
  fields: {
    email: { value: "climber@example.com" },
    password: { value: "password" },
  },
}

describe("SignInPresenter", () => {
  it.effect("uses the same adapter-owned message for invalid credentials", () =>
    Effect.gen(function* () {
      const presenter = yield* SignInPresenter
      const missingEmailResult =
        yield* presenter.presentEmailNotFound(initialViewModel)
      const invalidPasswordResult =
        yield* presenter.presentPasswordInvalid(initialViewModel)

      expect(missingEmailResult.error).toBe("Invalid email or password.")
      expect(invalidPasswordResult.error).toBe("Invalid email or password.")
    }).pipe(Effect.provide(SignInPresenter.Live))
  )

  it.effect("maps structured schema issues to their fields", () =>
    Effect.gen(function* () {
      const presenter = yield* SignInPresenter
      const schemaError = yield* Schema.decodeUnknownEffect(
        SignInControllerInputSchema
      )(
        {
          email: "invalid",
          password: "short",
        },
        { errors: "all" }
      ).pipe(Effect.flip)

      const result =
        yield* presenter.presentInputParseError(initialViewModel, schemaError)

      expect(result.fields.email.error).toBe(
        "email must be a valid email address"
      )
      expect(result.fields.password.error).toBe(
        "password must be between 8 and 128 characters"
      )
    }).pipe(Effect.provide(SignInPresenter.Live))
  )
})
