import { Effect, Layer, Option } from "effect"
import { Service } from "effect/Context"
import type { GetCurrentUserOutput } from "@auth/application/use-cases/get-current-user"
import type { SchemaError } from "effect/Schema"

import {
  getCurrentUserInitialViewModel,
  type GetCurrentUserViewModel,
} from "../view-models/get-current-user.view-model"

export class GetCurrentUserPresenter extends Service<
  GetCurrentUserPresenter,
  {
    readonly presentSuccess: (
      success: GetCurrentUserOutput
    ) => Effect.Effect<GetCurrentUserViewModel>

    readonly presentSchemaError: (
      error: SchemaError
    ) => Effect.Effect<GetCurrentUserViewModel>

    readonly presentUnexpectedError: () => Effect.Effect<GetCurrentUserViewModel>
  }
>()("@auth/adapters/next/GetCurrentUserPresenter") {
  static Live = Layer.succeed(GetCurrentUserPresenter, {
    presentSuccess: (currentUser) =>
      Effect.succeed(
        Option.match(currentUser, {
          onNone: () => getCurrentUserInitialViewModel,
          onSome: (user) => ({
            ...getCurrentUserInitialViewModel,
            status: "success",
            role: user.role,
            fields: {
              username: {
                ...getCurrentUserInitialViewModel.fields.username,
                value: user.username,
              },
            },
          }),
        })
      ),

    presentSchemaError: (_error) =>
      Effect.succeed({
        ...getCurrentUserInitialViewModel,
        status: "invalid",
        message: "Unable to load the current user.",
      }),

    presentUnexpectedError: () =>
      Effect.succeed({
        ...getCurrentUserInitialViewModel,
        status: "error",
        message: "Unable to load the current user. Please try again.",
      }),
  })
}
