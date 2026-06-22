import { describe, expect, it } from "@effect/vitest"
import { Effect, Schema } from "effect"

import {
  SignUpPresenter,
  type SignUpViewModel,
} from "../../src/presenters/sign-up.presenter"
import { SignUpControllerInputSchema } from "../../src/controllers/sign-up.controller"

const initialViewModel: SignUpViewModel = {
  status: "idle",
  fields: {
    username: { value: "climber" },
    email: { value: "climber@example.com" },
    password: { value: "password" },
    confirmPassword: { value: "password" },
  },
}

describe("SignUpPresenter", () => {
  it.effect("owns the username conflict message", () =>
    Effect.gen(function* () {
      const presenter = yield* SignUpPresenter
      const result =
        yield* presenter.presentUsernameAlreadyExists(initialViewModel)

      expect(result.error).toBe("That username is already taken.")
    }).pipe(Effect.provide(SignUpPresenter.Live))
  )

  it.effect("owns the email conflict message", () =>
    Effect.gen(function* () {
      const presenter = yield* SignUpPresenter
      const result =
        yield* presenter.presentEmailAlreadyExists(initialViewModel)

      expect(result.error).toBe(
        "An account with that email already exists."
      )
    }).pipe(Effect.provide(SignUpPresenter.Live))
  )

  it.effect("maps structured schema issues to their fields", () =>
    Effect.gen(function* () {
      const presenter = yield* SignUpPresenter
      const schemaError = yield* Schema.decodeUnknownEffect(
        SignUpControllerInputSchema
      )(
        {
          username: "!",
          email: "invalid",
          password: "short",
          confirmPassword: "different",
        },
        { errors: "all" }
      ).pipe(Effect.flip)

      const result =
        yield* presenter.presentInputParseError(initialViewModel, schemaError)

      expect(result.fields.username.error).toBe(
        "username must be between 3 and 32 characters"
      )
      expect(result.fields.email.error).toBe(
        "email must be a valid email address"
      )
      expect(result.fields.password.error).toBe(
        "password must be between 8 and 128 characters"
      )
      expect(result.fields.confirmPassword.error).toBe(
        "password must be between 8 and 128 characters"
      )
    }).pipe(Effect.provide(SignUpPresenter.Live))
  )
})
