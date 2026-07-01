import { Effect, Layer, SchemaIssue } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"
import type { CreateGymRouteOutput } from "@gym/application/use-cases/create-gym-route"

import {
  createGymRouteInitialViewModel,
  type CreateGymRouteViewModel,
} from "../view-models/create-gym-route.view-model"

export class CreateGymRoutePresenter extends Service<
  CreateGymRoutePresenter,
  {
    readonly presentSuccess: (
      success: CreateGymRouteOutput
    ) => Effect.Effect<CreateGymRouteViewModel>
    readonly presentSchemaError: (
      previous: CreateGymRouteViewModel,
      error: SchemaError
    ) => Effect.Effect<CreateGymRouteViewModel>
    readonly presentForbidden: (
      previous: CreateGymRouteViewModel
    ) => Effect.Effect<CreateGymRouteViewModel>
    readonly presentNotFound: (
      previous: CreateGymRouteViewModel
    ) => Effect.Effect<CreateGymRouteViewModel>
    readonly presentConflict: (
      previous: CreateGymRouteViewModel
    ) => Effect.Effect<CreateGymRouteViewModel>
    readonly presentBoulderNotAssignable: (
      previous: CreateGymRouteViewModel
    ) => Effect.Effect<CreateGymRouteViewModel>
    readonly presentUnexpectedError: (
      previous: CreateGymRouteViewModel
    ) => Effect.Effect<CreateGymRouteViewModel>
  }
>()("@gym/adapters/next/CreateGymRoutePresenter") {
  static Live = Layer.succeed(CreateGymRoutePresenter, {
    presentSuccess: (route) =>
      Effect.succeed({
        ...createGymRouteInitialViewModel,
        status: "success",
        message: `Created route ${route.order}.`,
      }),
    presentSchemaError: (previous, error) =>
      Effect.succeed({
        ...previous,
        status: "invalid",
        message: "Invalid input. Please check the route and try again.",
        errors: CreateGymRoutePresenter.formatErrors(error),
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
        message: "The selected gym or area no longer exists.",
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
    presentBoulderNotAssignable: (previous) =>
      Effect.succeed({
        ...previous,
        status: "invalid",
        message: "The selected boulder is not available to assign.",
        errors: {
          ...previous.errors,
          boulderId: "Choose one of your existing boulders.",
        },
      }),
    presentUnexpectedError: (previous) =>
      Effect.succeed({
        ...previous,
        status: "error",
        message: "Unable to create this route. Please try again.",
      }),
  })

  static formatErrors = (error: SchemaError) => {
    const { issues } = CreateGymRoutePresenter.toStandardSchema(error.issue)
    const fieldError = (
      field: keyof CreateGymRouteViewModel["fields"]
    ): string =>
      issues.find(({ path }) => path?.[0] === field)?.message ?? ""

    return {
      gymId: fieldError("gymId"),
      areaId: fieldError("areaId"),
      order: fieldError("order"),
      positionLabel: fieldError("positionLabel"),
      setOn: fieldError("setOn"),
      setterName: fieldError("setterName"),
      boulderId: fieldError("boulderId"),
    } satisfies CreateGymRouteViewModel["errors"]
  }

  static toStandardSchema = SchemaIssue.makeFormatterStandardSchemaV1()
}
