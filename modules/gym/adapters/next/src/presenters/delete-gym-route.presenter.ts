import { Effect, Layer, SchemaIssue } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"
import type { DeleteGymRouteOutput } from "@gym/application/use-cases/delete-gym-route"

import {
  deleteGymRouteInitialViewModel,
  type DeleteGymRouteViewModel,
} from "../view-models/delete-gym-route.view-model"

export class DeleteGymRoutePresenter extends Service<
  DeleteGymRoutePresenter,
  {
    readonly presentSuccess: (
      success: DeleteGymRouteOutput
    ) => Effect.Effect<DeleteGymRouteViewModel>
    readonly presentSchemaError: (
      previous: DeleteGymRouteViewModel,
      error: SchemaError
    ) => Effect.Effect<DeleteGymRouteViewModel>
    readonly presentForbidden: (
      previous: DeleteGymRouteViewModel
    ) => Effect.Effect<DeleteGymRouteViewModel>
    readonly presentNotFound: (
      previous: DeleteGymRouteViewModel
    ) => Effect.Effect<DeleteGymRouteViewModel>
    readonly presentUnexpectedError: (
      previous: DeleteGymRouteViewModel
    ) => Effect.Effect<DeleteGymRouteViewModel>
  }
>()("@gym/adapters/next/DeleteGymRoutePresenter") {
  static Live = Layer.succeed(DeleteGymRoutePresenter, {
    presentSuccess: (route) =>
      Effect.succeed({
        ...deleteGymRouteInitialViewModel,
        status: "success",
        message: `Deleted route ${route.order}.`,
        fields: {
          ...deleteGymRouteInitialViewModel.fields,
          routeId: {
            ...deleteGymRouteInitialViewModel.fields.routeId,
            value: route.id,
          },
        },
      }),
    presentSchemaError: (previous, error) =>
      Effect.succeed({
        ...previous,
        status: "invalid",
        message: "Choose a valid route to delete.",
        errors: DeleteGymRoutePresenter.formatErrors(error),
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
        message: "That route is no longer available in this gym.",
      }),
    presentUnexpectedError: (previous) =>
      Effect.succeed({
        ...previous,
        status: "error",
        message: "Unable to delete this route. Please try again.",
      }),
  })

  static formatErrors = (error: SchemaError) => {
    const { issues } = DeleteGymRoutePresenter.toStandardSchema(error.issue)
    const fieldError = (
      field: keyof DeleteGymRouteViewModel["fields"]
    ): string => issues.find(({ path }) => path?.[0] === field)?.message ?? ""

    return {
      gymId: fieldError("gymId"),
      routeId: fieldError("routeId"),
    } satisfies DeleteGymRouteViewModel["errors"]
  }

  static toStandardSchema = SchemaIssue.makeFormatterStandardSchemaV1()
}
