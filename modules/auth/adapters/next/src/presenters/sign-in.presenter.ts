import { Effect, Layer, SchemaIssue } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

const formatSchemaIssue = SchemaIssue.makeFormatterStandardSchemaV1()

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
              email: { value: prev.fields.email.value },
              password: {
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
          const errorFor = (field: keyof SignInViewModel["fields"]) => {
            const message = issues.find(
              (issue) => issue.path?.[0] === field
            )?.message

            return message === undefined ? {} : { error: message }
          }

          return Effect.succeed({
            status: "error",
            error: "Invalid input. Please check your data and try again.",
            fields: {
              email: {
                value: prev.fields.email.value,
                ...errorFor("email"),
              },
              password: {
                value: prev.fields.password.value,
                ...errorFor("password"),
              },
            },
          })
        },

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
