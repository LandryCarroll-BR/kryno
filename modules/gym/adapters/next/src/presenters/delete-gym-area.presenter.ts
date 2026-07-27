import { Effect, Layer, SchemaIssue } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"
import type { DeleteGymAreaOutput } from "@gym/application/use-cases/delete-gym-area"

import {
  deleteGymAreaInitialViewModel,
  type DeleteGymAreaViewModel,
} from "../view-models/delete-gym-area.view-model"

export class DeleteGymAreaPresenter extends Service<
  DeleteGymAreaPresenter,
  {
    readonly presentSuccess: (
      success: DeleteGymAreaOutput
    ) => Effect.Effect<DeleteGymAreaViewModel>
    readonly presentSchemaError: (
      previous: DeleteGymAreaViewModel,
      error: SchemaError
    ) => Effect.Effect<DeleteGymAreaViewModel>
    readonly presentForbidden: (
      previous: DeleteGymAreaViewModel
    ) => Effect.Effect<DeleteGymAreaViewModel>
    readonly presentNotFound: (
      previous: DeleteGymAreaViewModel
    ) => Effect.Effect<DeleteGymAreaViewModel>
    readonly presentUnexpectedError: (
      previous: DeleteGymAreaViewModel
    ) => Effect.Effect<DeleteGymAreaViewModel>
  }
>()("@gym/adapters/next/DeleteGymAreaPresenter") {
  static Live = Layer.succeed(DeleteGymAreaPresenter, {
    presentSuccess: ({ area, deletedRoutes }) =>
      Effect.succeed({
        ...deleteGymAreaInitialViewModel,
        status: "success",
        message:
          deletedRoutes.length === 0
            ? `Deleted ${area.name}.`
            : `Deleted ${area.name} and ${deletedRoutes.length} route${
                deletedRoutes.length === 1 ? "" : "s"
              }.`,
        fields: {
          ...deleteGymAreaInitialViewModel.fields,
          areaId: {
            ...deleteGymAreaInitialViewModel.fields.areaId,
            value: area.id,
          },
        },
      }),
    presentSchemaError: (previous, error) =>
      Effect.succeed({
        ...previous,
        status: "invalid",
        message: "Choose a valid area to delete.",
        errors: DeleteGymAreaPresenter.formatErrors(error),
      }),
    presentForbidden: (previous) =>
      Effect.succeed({
        ...previous,
        status: "forbidden",
        message: "You are not authorized to manage this gym.",
      }),
    presentNotFound: (previous) =>
      Effect.succeed({
        ...previous,
        status: "not-found",
        message: "That area is no longer available in this gym.",
      }),
    presentUnexpectedError: (previous) =>
      Effect.succeed({
        ...previous,
        status: "error",
        message: "Unable to delete this area. Please try again.",
      }),
  })

  static formatErrors = (error: SchemaError) => {
    const { issues } = DeleteGymAreaPresenter.toStandardSchema(error.issue)
    const fieldError = (
      field: keyof DeleteGymAreaViewModel["fields"]
    ): string => issues.find(({ path }) => path?.[0] === field)?.message ?? ""

    return {
      gymId: fieldError("gymId"),
      areaId: fieldError("areaId"),
    } satisfies DeleteGymAreaViewModel["errors"]
  }

  static toStandardSchema = SchemaIssue.makeFormatterStandardSchemaV1()
}
