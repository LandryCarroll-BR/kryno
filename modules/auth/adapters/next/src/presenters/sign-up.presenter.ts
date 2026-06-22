import { Effect, Layer, SchemaIssue } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

const formatSchemaIssue = SchemaIssue.makeFormatterStandardSchemaV1()

export class SignUpPresenter extends Service<
  SignUpPresenter,
  {
    readonly presentSuccess: (
      prev: SignUpViewModel
    ) => Effect.Effect<SignUpViewModel>

    readonly presentInputParseError: (
      prev: SignUpViewModel,
      error: SchemaError
    ) => Effect.Effect<SignUpViewModel>

    readonly presentUsernameAlreadyExists: (
      prev: SignUpViewModel
    ) => Effect.Effect<SignUpViewModel>

    readonly presentEmailAlreadyExists: (
      prev: SignUpViewModel
    ) => Effect.Effect<SignUpViewModel>

    readonly presentUnexpectedError: (
      prev: SignUpViewModel
    ) => Effect.Effect<SignUpViewModel>
  }
>()("@auth/adapters/next/SignUpPresenter") {
  static Live = Layer.effect(
    SignUpPresenter,
    Effect.gen(function* () {
      return {
        presentSuccess: (prev) =>
          Effect.succeed({
            status: "success",
            fields: {
              username: {
                value: prev.fields.username.value,
              },
              email: {
                value: prev.fields.email.value,
              },
              password: {
                value: prev.fields.password.value,
              },
              confirmPassword: {
                value: prev.fields.confirmPassword.value,
              },
            },
          }),

        presentUsernameAlreadyExists: (prev) =>
          Effect.succeed({
            status: "error",
            error: "That username is already taken.",
            fields: {
              ...prev.fields,
            },
          }),

        presentEmailAlreadyExists: (prev) =>
          Effect.succeed({
            status: "error",
            error: "An account with that email already exists.",
            fields: {
              ...prev.fields,
            },
          }),

        presentInputParseError: (prev, error) => {
          const { issues } = formatSchemaIssue(error.issue)
          const errorFor = (field: keyof SignUpViewModel["fields"]) => {
            const message = issues.find(
              (issue) => issue.path?.[0] === field
            )?.message

            return message === undefined ? {} : { error: message }
          }

          return Effect.succeed({
            status: "error",
            error: "Invalid input. Please check your data and try again.",
            fields: {
              username: {
                value: prev.fields.username.value,
                ...errorFor("username"),
              },
              email: {
                value: prev.fields.email.value,
                ...errorFor("email"),
              },
              password: {
                value: prev.fields.password.value,
                ...errorFor("password"),
              },
              confirmPassword: {
                value: prev.fields.confirmPassword.value,
                ...errorFor("confirmPassword"),
              },
            },
          })
        },

        presentUnexpectedError: (prev) =>
          Effect.succeed({
            status: "error",
            error: "An unexpected error occurred. Please try again.",
            fields: {
              username: {
                value: prev.fields.username.value,
              },
              email: {
                value: prev.fields.email.value,
              },
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
