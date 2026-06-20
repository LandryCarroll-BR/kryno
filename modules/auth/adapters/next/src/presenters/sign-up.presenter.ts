import type {
  UserEmailAlreadyExistsError,
  UsernameAlreadyExistsError,
} from "@auth/application"
import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

export class SignUpPresenter extends Service<
  SignUpPresenter,
  {
    readonly presentSuccess: (prev: SignUpViewModel) => SignUpViewModel
    readonly presentInputParseError: (
      prev: SignUpViewModel,
      error: SchemaError
    ) => SignUpViewModel
    readonly presentError: (
      prev: SignUpViewModel,
      error: UsernameAlreadyExistsError | UserEmailAlreadyExistsError
    ) => SignUpViewModel
    readonly presentUnexpectedError: (
      prev: SignUpViewModel
    ) => SignUpViewModel
  }
>()("@auth/adapters/next/SignUpPresenter") {
  static Live = Layer.effect(
    SignUpPresenter,
    Effect.gen(function* () {
      return {
        presentSuccess: (prev) => ({
          status: "success",
          fields: {
            username: {
              value: prev.fields.username.value,
            },
            email: { value: prev.fields.email.value },
            password: {
              value: prev.fields.password.value,
            },
            confirmPassword: {
              value: prev.fields.confirmPassword.value,
            },
          },
        }),
        presentError: (prev, error) => ({
          status: "error",
          error: error.message,
          fields: {
            ...prev.fields,
          },
        }),
        presentInputParseError: (prev, error) => ({
          status: "error",
          error: "Invalid input. Please check your data and try again.",
          fields: {
            username: {
              value: prev.fields.username.value,
              ...fieldError("username", error),
            },
            email: {
              value: prev.fields.email.value,
              ...fieldError("email", error),
            },
            password: {
              value: prev.fields.password.value,
              ...fieldError("password", error),
            },
            confirmPassword: {
              value: prev.fields.confirmPassword.value,
              ...fieldError("confirmPassword", error),
            },
          },
        }),
        presentUnexpectedError: (prev) => ({
          status: "error",
          error: "An unexpected error occurred. Please try again.",
          fields: {
            username: {
              value: prev.fields.username.value,
            },
            email: { value: prev.fields.email.value },
            password: {
              value: prev.fields.password.value,
            },
            confirmPassword: {
              value: prev.fields.confirmPassword.value,
            },
          },
        }),
      }
    })
  )
}

export type SignUpViewModel = {
  status: "idle" | "loading" | "success" | "error"
  error?: string
  fields: {
    username: {
      value: string
      error?: string
    }
    email: {
      value: string
      error?: string
    }
    password: {
      value: string
      error?: string
    }
    confirmPassword: {
      value: string
      error?: string
    }
  }
}

const fieldError = (key: string, error: SchemaError) =>
  error.message.includes(key)
    ? { error: error.message.split(`at ["${key}"]`)[0] }
    : {}
