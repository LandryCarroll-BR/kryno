import type {
  UserEmailNotFoundError,
  UserPasswordInvalidError,
} from "@auth/application"
import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

export class SignInPresenter extends Service<
  SignInPresenter,
  {
    readonly presentSuccess: (
      prev: SignInViewModel
    ) => Effect.Effect<SignInViewModel>

    readonly presentInputParseError: (
      prev: SignInViewModel,
      error: SchemaError
    ) => Effect.Effect<SignInViewModel>

    readonly presentError: (
      prev: SignInViewModel,
      error: UserEmailNotFoundError | UserPasswordInvalidError
    ) => Effect.Effect<SignInViewModel>

    readonly presentUnexpectedError: (
      prev: SignInViewModel
    ) => Effect.Effect<SignInViewModel>
  }
>()("@auth/adapters/next/SignInPresenter") {
  static Live = Layer.effect(
    SignInPresenter,
    Effect.gen(function* () {
      return {
        presentSuccess: (prev) =>
          Effect.succeed({
            status: "success",
            fields: {
              email: { value: prev.fields.email.value },
              password: {
                value: prev.fields.password.value,
              },
            },
          }),

        presentError: (prev, error) =>
          Effect.succeed({
            status: "error",
            error: error.message,
            fields: {
              ...prev.fields,
            },
          }),

        presentInputParseError: (prev, error) =>
          Effect.succeed({
            status: "error",
            error: "Invalid input. Please check your data and try again.",
            fields: {
              email: {
                value: prev.fields.email.value,
                ...fieldError("email", error),
              },
              password: {
                value: prev.fields.password.value,
                ...fieldError("password", error),
              },
            },
          }),

        presentUnexpectedError: (prev) =>
          Effect.succeed({
            status: "error",
            error: "An unexpected error occurred. Please try again.",
            fields: {
              email: { value: prev.fields.email.value },
              password: {
                value: prev.fields.password.value,
              },
            },
          }),
      }
    })
  )
}

export type SignInViewModel = {
  status: "idle" | "loading" | "success" | "error"
  error?: string
  fields: {
    email: {
      value: string
      error?: string
    }
    password: {
      value: string
      error?: string
    }
  }
}

const fieldError = (key: string, error: SchemaError) =>
  error.message.includes(key)
    ? { error: error.message.split(`at ["${key}"]`)[0] }
    : {}
