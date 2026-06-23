import { Effect, Layer, SchemaIssue } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

const formatSchemaIssue = SchemaIssue.makeFormatterStandardSchemaV1()

type SignUpFieldViewModel =
  | {
      readonly status: "valid"
      readonly value: string
    }
  | {
      readonly status: "invalid"
      readonly value: string
      readonly error: string
    }

type SignUpFieldsViewModel = {
  readonly username: SignUpFieldViewModel
  readonly email: SignUpFieldViewModel
  readonly password: SignUpFieldViewModel
  readonly confirmPassword: SignUpFieldViewModel
}

export type SignUpViewModel =
  | {
      readonly status: "idle"
      readonly fields: SignUpFieldsViewModel
    }
  | {
      readonly status: "loading"
      readonly fields: SignUpFieldsViewModel
    }
  | {
      readonly status: "success"
      readonly fields: SignUpFieldsViewModel
    }
  | {
      readonly status: "error"
      readonly error: string
      readonly fields: SignUpFieldsViewModel
    }

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
                status: "valid",
                value: prev.fields.username.value,
              },
              email: {
                status: "valid",
                value: prev.fields.email.value,
              },
              password: {
                status: "valid",
                value: prev.fields.password.value,
              },
              confirmPassword: {
                status: "valid",
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
          const fieldFor = (
            field: keyof SignUpFieldsViewModel
          ): SignUpFieldViewModel => {
            const message = issues.find(
              (issue) => issue.path?.[0] === field
            )?.message

            return message === undefined
              ? { status: "valid", value: prev.fields[field].value }
              : {
                  status: "invalid",
                  value: prev.fields[field].value,
                  error: message,
                }
          }

          return Effect.succeed({
            status: "error",
            error: "Invalid input. Please check your data and try again.",
            fields: {
              username: fieldFor("username"),
              email: fieldFor("email"),
              password: fieldFor("password"),
              confirmPassword: fieldFor("confirmPassword"),
            },
          })
        },

        presentUnexpectedError: (prev) =>
          Effect.succeed({
            status: "error",
            error: "An unexpected error occurred. Please try again.",
            fields: {
              username: {
                status: "valid",
                value: prev.fields.username.value,
              },
              email: {
                status: "valid",
                value: prev.fields.email.value,
              },
              password: {
                status: "valid",
                value: prev.fields.password.value,
              },
              confirmPassword: {
                status: "valid",
                value: prev.fields.confirmPassword.value,
              },
            },
          }),
      }
    })
  )
}
