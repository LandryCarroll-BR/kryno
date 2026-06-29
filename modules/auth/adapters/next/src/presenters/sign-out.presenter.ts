import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import type { SignOutOutput } from "@auth/application/use-cases/sign-out"
import type { SchemaError } from "effect/Schema"

import {
  signOutInitialViewModel,
  type SignOutViewModel,
} from "../view-models/sign-out.view-model"

export class SignOutPresenter extends Service<
  SignOutPresenter,
  {
    readonly presentSuccess: (
      success: SignOutOutput
    ) => Effect.Effect<SignOutViewModel>

    readonly presentSchemaError: (
      previousState: SignOutViewModel,
      error: SchemaError
    ) => Effect.Effect<SignOutViewModel>

    readonly presentUnexpectedError: (
      previousState: SignOutViewModel
    ) => Effect.Effect<SignOutViewModel>
  }
>()("@auth/adapters/next/SignOutPresenter") {
  static Live = Layer.succeed(SignOutPresenter, {
    presentSuccess: (_success) =>
      Effect.succeed({
        ...signOutInitialViewModel,
        status: "success",
        message: "Signed out successfully.",
      }),

    presentSchemaError: (previousState, _error) =>
      Effect.succeed({
        ...previousState,
        status: "invalid",
        message: "Unable to sign out. Please try again.",
      }),

    presentUnexpectedError: (previousState) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "An unexpected error occurred. Please try again.",
      }),
  })
}
