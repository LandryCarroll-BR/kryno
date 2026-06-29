import { Effect, Layer, SchemaIssue } from "effect"
import { Service } from "effect/Context"
import type {
  UserEmailAlreadyExistsError,
  UsernameAlreadyExistsError,
} from "@auth/application/errors/user"
import type { SignUpOutput } from "@auth/application/use-cases/sign-up"
import type { SchemaError } from "effect/Schema"

import {
  signUpInitialViewModel,
  type SignUpViewModel,
} from "../view-models/sign-up.view-model"

export class SignUpPresenter extends Service<
  SignUpPresenter,
  {
    readonly presentSuccess: (
      success: SignUpOutput
    ) => Effect.Effect<SignUpViewModel>

    readonly presentSchemaError: (
      previousState: SignUpViewModel,
      error: SchemaError
    ) => Effect.Effect<SignUpViewModel>

    readonly presentUsernameAlreadyExists: (
      previousState: SignUpViewModel,
      error: UsernameAlreadyExistsError
    ) => Effect.Effect<SignUpViewModel>

    readonly presentEmailAlreadyExists: (
      previousState: SignUpViewModel,
      error: UserEmailAlreadyExistsError
    ) => Effect.Effect<SignUpViewModel>

    readonly presentUnexpectedError: (
      previousState: SignUpViewModel
    ) => Effect.Effect<SignUpViewModel>
  }
>()("@auth/adapters/next/SignUpPresenter") {
  static Live = Layer.succeed(SignUpPresenter, {
    presentSuccess: (_success) =>
      Effect.succeed({
        ...signUpInitialViewModel,
        status: "success",
        message: "Your account has been created.",
      }),

    presentSchemaError: (previousState, error) =>
      Effect.succeed({
        ...previousState,
        status: "invalid",
        message: "Invalid input. Please check your data and try again.",
        errors: SignUpPresenter.formatErrors(error),
      }),

    presentUsernameAlreadyExists: (previousState, _error) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "That username is already taken.",
      }),

    presentEmailAlreadyExists: (previousState, _error) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "An account with that email already exists.",
      }),

    presentUnexpectedError: (previousState) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "An unexpected error occurred. Please try again.",
      }),
  })

  static formatErrors = (error: SchemaError) => {
    const { issues } = SignUpPresenter.toStandardSchema(error.issue)

    const fieldError = (
      field: keyof SignUpViewModel["fields"]
    ): string => issues.find(({ path }) => path?.[0] === field)?.message ?? ""

    return {
      username: fieldError("username"),
      email: fieldError("email"),
      password: fieldError("password"),
      confirmPassword: fieldError("confirmPassword"),
    } satisfies SignUpViewModel["errors"]
  }

  static toStandardSchema = SchemaIssue.makeFormatterStandardSchemaV1()
}
