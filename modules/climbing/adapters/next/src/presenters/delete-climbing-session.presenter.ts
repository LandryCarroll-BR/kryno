import { Effect, Layer, SchemaIssue } from "effect"
import { Service } from "effect/Context"
import type {
  ActiveClimbingSessionCannotBeDeletedError,
  PastClimbingSessionNotFoundError,
} from "@climbing/application/errors/climbing-session"
import type { DeleteClimbingSessionOutput } from "@climbing/application/use-cases/delete-climbing-session"
import type { SchemaError } from "effect/Schema"

import {
  deleteClimbingSessionInitialViewModel,
  type DeleteClimbingSessionViewModel,
} from "../view-models/delete-climbing-session.view-model"

export class DeleteClimbingSessionPresenter extends Service<
  DeleteClimbingSessionPresenter,
  {
    readonly presentSuccess: (
      success: DeleteClimbingSessionOutput
    ) => Effect.Effect<DeleteClimbingSessionViewModel>

    readonly presentSchemaError: (
      previousState: DeleteClimbingSessionViewModel,
      error: SchemaError
    ) => Effect.Effect<DeleteClimbingSessionViewModel>

    readonly presentPastClimbingSessionNotFound: (
      previousState: DeleteClimbingSessionViewModel,
      error: PastClimbingSessionNotFoundError
    ) => Effect.Effect<DeleteClimbingSessionViewModel>

    readonly presentActiveClimbingSessionCannotBeDeleted: (
      previousState: DeleteClimbingSessionViewModel,
      error: ActiveClimbingSessionCannotBeDeletedError
    ) => Effect.Effect<DeleteClimbingSessionViewModel>

    readonly presentUnexpectedError: (
      previousState: DeleteClimbingSessionViewModel
    ) => Effect.Effect<DeleteClimbingSessionViewModel>
  }
>()("@climbing/adapters/next/DeleteClimbingSessionPresenter") {
  static Live = Layer.succeed(DeleteClimbingSessionPresenter, {
    presentSuccess: (session) =>
      Effect.succeed({
        ...deleteClimbingSessionInitialViewModel,
        status: "success",
        message: "Your past climbing session was permanently deleted.",
        fields: {
          climbingSessionId: {
            ...deleteClimbingSessionInitialViewModel.fields.climbingSessionId,
            value: session.id,
          },
        },
      }),

    presentSchemaError: (previousState, error) =>
      Effect.succeed({
        ...previousState,
        status: "invalid",
        message: "Choose a valid climbing session to delete.",
        errors: DeleteClimbingSessionPresenter.formatErrors(error),
      }),

    presentPastClimbingSessionNotFound: (previousState, _error) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "That past climbing session is no longer available.",
      }),

    presentActiveClimbingSessionCannotBeDeleted: (previousState, _error) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "End this climbing session before deleting it.",
      }),

    presentUnexpectedError: (previousState) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "Unable to delete this climbing session. Please try again.",
      }),
  })

  static formatErrors = (error: SchemaError) => {
    const { issues } = DeleteClimbingSessionPresenter.toStandardSchema(
      error.issue
    )

    const fieldError = (
      field: keyof DeleteClimbingSessionViewModel["fields"]
    ): string => issues.find(({ path }) => path?.[0] === field)?.message ?? ""

    return {
      climbingSessionId: fieldError("climbingSessionId"),
    } satisfies DeleteClimbingSessionViewModel["errors"]
  }

  static toStandardSchema = SchemaIssue.makeFormatterStandardSchemaV1()
}
