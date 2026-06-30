import { Effect, Layer, SchemaIssue } from "effect"
import { Service } from "effect/Context"
import type {
  CreatedBoulderNotFoundError,
  UnauthorizedToDeleteBoulderError,
} from "@climbing/application/errors/boulder"
import type { DeleteBoulderOutput } from "@climbing/application/use-cases/delete-boulder"
import type { SchemaError } from "effect/Schema"

import {
  deleteBoulderInitialViewModel,
  type DeleteBoulderViewModel,
} from "../view-models/delete-boulder.view-model"

export class DeleteBoulderPresenter extends Service<
  DeleteBoulderPresenter,
  {
    readonly presentSuccess: (
      success: DeleteBoulderOutput
    ) => Effect.Effect<DeleteBoulderViewModel>

    readonly presentSchemaError: (
      previousState: DeleteBoulderViewModel,
      error: SchemaError
    ) => Effect.Effect<DeleteBoulderViewModel>

    readonly presentCreatedBoulderNotFound: (
      previousState: DeleteBoulderViewModel,
      error: CreatedBoulderNotFoundError
    ) => Effect.Effect<DeleteBoulderViewModel>

    readonly presentUnauthorizedToDeleteBoulder: (
      previousState: DeleteBoulderViewModel,
      error: UnauthorizedToDeleteBoulderError
    ) => Effect.Effect<DeleteBoulderViewModel>

    readonly presentUnexpectedError: (
      previousState: DeleteBoulderViewModel
    ) => Effect.Effect<DeleteBoulderViewModel>
  }
>()("@climbing/adapters/next/DeleteBoulderPresenter") {
  static Live = Layer.succeed(DeleteBoulderPresenter, {
    presentSuccess: (boulder) =>
      Effect.succeed({
        ...deleteBoulderInitialViewModel,
        status: "success",
        message: `${boulder.name} was permanently deleted.`,
        fields: {
          boulderId: {
            ...deleteBoulderInitialViewModel.fields.boulderId,
            value: boulder.id,
          },
        },
      }),

    presentSchemaError: (previousState, error) =>
      Effect.succeed({
        ...previousState,
        status: "invalid",
        message: "Choose a valid boulder to delete.",
        errors: DeleteBoulderPresenter.formatErrors(error),
      }),

    presentCreatedBoulderNotFound: (previousState, _error) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "That boulder is no longer available in your boulders.",
      }),

    presentUnauthorizedToDeleteBoulder: (previousState, _error) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "You are not authorized to delete that boulder.",
      }),

    presentUnexpectedError: (previousState) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "Unable to delete this boulder. Please try again.",
      }),
  })

  static formatErrors = (error: SchemaError) => {
    const { issues } = DeleteBoulderPresenter.toStandardSchema(error.issue)

    const fieldError = (
      field: keyof DeleteBoulderViewModel["fields"]
    ): string => issues.find(({ path }) => path?.[0] === field)?.message ?? ""

    return {
      boulderId: fieldError("boulderId"),
    } satisfies DeleteBoulderViewModel["errors"]
  }

  static toStandardSchema = SchemaIssue.makeFormatterStandardSchemaV1()
}
