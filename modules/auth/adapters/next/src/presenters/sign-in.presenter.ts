import { Effect, Layer, SchemaIssue } from "effect"
import { Service } from "effect/Context"
import type {
  UserEmailNotFoundError,
  UserPasswordInvalidError,
} from "@auth/application/errors/user"
import type { SignInOutput } from "@auth/application/use-cases/sign-in"
import type { SchemaError } from "effect/Schema"

import {
  signInInitialViewModel,
  type SignInViewModel,
} from "../view-models/sign-in.view-model"

export class SignInPresenter extends Service<
  SignInPresenter,
  {
    readonly presentSuccess: (
      success: SignInOutput
    ) => Effect.Effect<SignInViewModel>

    readonly presentSchemaError: (
      previousState: SignInViewModel,
      error: SchemaError
    ) => Effect.Effect<SignInViewModel>

    readonly presentEmailNotFound: (
      previousState: SignInViewModel,
      error: UserEmailNotFoundError
    ) => Effect.Effect<SignInViewModel>

    readonly presentPasswordInvalid: (
      previousState: SignInViewModel,
      error: UserPasswordInvalidError
    ) => Effect.Effect<SignInViewModel>

    readonly presentUnexpectedError: (
      previousState: SignInViewModel
    ) => Effect.Effect<SignInViewModel>
  }
>()("@auth/adapters/next/SignInPresenter") {
  static Live = Layer.succeed(SignInPresenter, {
    presentSuccess: (_success) =>
      Effect.succeed({
        ...signInInitialViewModel,
        status: "success",
        message: "Signed in successfully.",
      }),

    presentSchemaError: (previousState, error) =>
      Effect.succeed({
        ...previousState,
        status: "invalid",
        message: "Invalid input. Please check your data and try again.",
        errors: SignInPresenter.formatErrors(error),
      }),

    presentEmailNotFound: (previousState, _error) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "Invalid email or password.",
      }),

    presentPasswordInvalid: (previousState, _error) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "Invalid email or password.",
      }),

    presentUnexpectedError: (previousState) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "An unexpected error occurred. Please try again.",
      }),
  })

  static formatErrors = (error: SchemaError) => {
    const { issues } = SignInPresenter.toStandardSchema(error.issue)

    const fieldError = (
      field: keyof SignInViewModel["fields"]
    ): string => issues.find(({ path }) => path?.[0] === field)?.message ?? ""

    return {
      email: fieldError("email"),
      password: fieldError("password"),
    } satisfies SignInViewModel["errors"]
  }

  static toStandardSchema = SchemaIssue.makeFormatterStandardSchemaV1()
}
