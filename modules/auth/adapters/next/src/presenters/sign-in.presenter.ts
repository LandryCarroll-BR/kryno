import { Effect, Layer, SchemaIssue } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

const formatSchemaIssue = SchemaIssue.makeFormatterStandardSchemaV1()

type SignInFieldViewModel =
  | {
      readonly status: "valid"
      readonly value: string
    }
  | {
      readonly status: "invalid"
      readonly value: string
      readonly error: string
    }

type SignInFieldsViewModel = {
  readonly email: SignInFieldViewModel
  readonly password: SignInFieldViewModel
}

export type SignInViewModel =
  | {
      readonly status: "idle"
      readonly fields: SignInFieldsViewModel
    }
  | {
      readonly status: "loading"
      readonly fields: SignInFieldsViewModel
    }
  | {
      readonly status: "success"
      readonly fields: SignInFieldsViewModel
    }
  | {
      readonly status: "error"
      readonly error: string
      readonly fields: SignInFieldsViewModel
    }

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

    readonly presentEmailNotFound: (
      prev: SignInViewModel
    ) => Effect.Effect<SignInViewModel>

    readonly presentPasswordInvalid: (
      prev: SignInViewModel
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
              email: { status: "valid", value: prev.fields.email.value },
              password: {
                status: "valid",
                value: prev.fields.password.value,
              },
            },
          }),

        presentEmailNotFound: (prev) =>
          Effect.succeed({
            status: "error",
            error: "Invalid email or password.",
            fields: {
              ...prev.fields,
            },
          }),

        presentPasswordInvalid: (prev) =>
          Effect.succeed({
            status: "error",
            error: "Invalid email or password.",
            fields: {
              ...prev.fields,
            },
          }),

        presentInputParseError: (prev, error) => {
          const { issues } = formatSchemaIssue(error.issue)
          const fieldFor = (
            field: keyof SignInFieldsViewModel
          ): SignInFieldViewModel => {
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
              email: fieldFor("email"),
              password: fieldFor("password"),
            },
          })
        },

        presentUnexpectedError: (prev) =>
          Effect.succeed({
            status: "error",
            error: "An unexpected error occurred. Please try again.",
            fields: {
              email: { status: "valid", value: prev.fields.email.value },
              password: {
                status: "valid",
                value: prev.fields.password.value,
              },
            },
          }),
      }
    })
  )
}
