import { Effect, Layer, Option, SchemaIssue } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"
import type { EditGymRouteOutput } from "@gym/application/use-cases/edit-gym-route"

import {
  editGymRouteInitialViewModel,
  type EditGymRouteViewModel,
} from "../view-models/edit-gym-route.view-model"

export class EditGymRoutePresenter extends Service<
  EditGymRoutePresenter,
  {
    readonly presentSuccess: (
      success: EditGymRouteOutput
    ) => Effect.Effect<EditGymRouteViewModel>
    readonly presentSchemaError: (
      previous: EditGymRouteViewModel,
      error: SchemaError
    ) => Effect.Effect<EditGymRouteViewModel>
    readonly presentForbidden: (
      previous: EditGymRouteViewModel
    ) => Effect.Effect<EditGymRouteViewModel>
    readonly presentNotFound: (
      previous: EditGymRouteViewModel
    ) => Effect.Effect<EditGymRouteViewModel>
    readonly presentConflict: (
      previous: EditGymRouteViewModel
    ) => Effect.Effect<EditGymRouteViewModel>
    readonly presentUnexpectedError: (
      previous: EditGymRouteViewModel
    ) => Effect.Effect<EditGymRouteViewModel>
  }
>()("@gym/adapters/next/EditGymRoutePresenter") {
  static Live = Layer.succeed(EditGymRoutePresenter, {
    presentSuccess: (route) =>
      Effect.succeed({
        ...editGymRouteInitialViewModel,
        status: "success",
        message: `Updated route ${route.order}.`,
        fields: {
          ...editGymRouteInitialViewModel.fields,
          routeId: {
            ...editGymRouteInitialViewModel.fields.routeId,
            value: route.id,
          },
          areaId: {
            ...editGymRouteInitialViewModel.fields.areaId,
            value: route.areaId,
          },
          order: {
            ...editGymRouteInitialViewModel.fields.order,
            value: String(route.order),
          },
          positionLabel: {
            ...editGymRouteInitialViewModel.fields.positionLabel,
            value: Option.getOrNull(route.positionLabel) ?? "",
          },
          setOn: {
            ...editGymRouteInitialViewModel.fields.setOn,
            value: route.setOn,
          },
          setterName: {
            ...editGymRouteInitialViewModel.fields.setterName,
            value: Option.getOrNull(route.setterName) ?? "",
          },
        },
      }),
    presentSchemaError: (previous, error) =>
      Effect.succeed({
        ...previous,
        status: "invalid",
        message: "Invalid input. Please check the route and try again.",
        errors: EditGymRoutePresenter.formatErrors(error),
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
        message: "The selected gym, area, or route no longer exists.",
      }),
    presentConflict: (previous) =>
      Effect.succeed({
        ...previous,
        status: "conflict",
        message: "That route order is already in use in this area.",
        errors: {
          ...previous.errors,
          order: "Route order must be unique within an area.",
        },
      }),
    presentUnexpectedError: (previous) =>
      Effect.succeed({
        ...previous,
        status: "error",
        message: "Unable to update this route. Please try again.",
      }),
  })

  static formatErrors = (error: SchemaError) => {
    const { issues } = EditGymRoutePresenter.toStandardSchema(error.issue)
    const fieldError = (
      field: keyof EditGymRouteViewModel["fields"]
    ): string => issues.find(({ path }) => path?.[0] === field)?.message ?? ""

    return {
      gymId: fieldError("gymId"),
      routeId: fieldError("routeId"),
      areaId: fieldError("areaId"),
      order: fieldError("order"),
      positionLabel: fieldError("positionLabel"),
      setOn: fieldError("setOn"),
      setterName: fieldError("setterName"),
      routeImage: fieldError("routeImage"),
    } satisfies EditGymRouteViewModel["errors"]
  }

  static toStandardSchema = SchemaIssue.makeFormatterStandardSchemaV1()
}
