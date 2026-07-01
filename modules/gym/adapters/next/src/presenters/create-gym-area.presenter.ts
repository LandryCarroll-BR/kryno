import { Effect, Layer, SchemaIssue } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"
import type { CreateGymAreaOutput } from "@gym/application/use-cases/create-gym-area"

import {
  createGymAreaInitialViewModel,
  type CreateGymAreaViewModel,
} from "../view-models/create-gym-area.view-model"

export class CreateGymAreaPresenter extends Service<
  CreateGymAreaPresenter,
  {
    readonly presentSuccess: (
      success: CreateGymAreaOutput
    ) => Effect.Effect<CreateGymAreaViewModel>
    readonly presentSchemaError: (
      previous: CreateGymAreaViewModel,
      error: SchemaError
    ) => Effect.Effect<CreateGymAreaViewModel>
    readonly presentForbidden: (
      previous: CreateGymAreaViewModel
    ) => Effect.Effect<CreateGymAreaViewModel>
    readonly presentNotFound: (
      previous: CreateGymAreaViewModel
    ) => Effect.Effect<CreateGymAreaViewModel>
    readonly presentConflict: (
      previous: CreateGymAreaViewModel
    ) => Effect.Effect<CreateGymAreaViewModel>
    readonly presentUnexpectedError: (
      previous: CreateGymAreaViewModel
    ) => Effect.Effect<CreateGymAreaViewModel>
  }
>()("@gym/adapters/next/CreateGymAreaPresenter") {
  static Live = Layer.succeed(CreateGymAreaPresenter, {
    presentSuccess: (area) =>
      Effect.succeed({
        ...createGymAreaInitialViewModel,
        status: "success",
        message: `Created ${area.name}.`,
      }),
    presentSchemaError: (previous, error) =>
      Effect.succeed({
        ...previous,
        status: "invalid",
        message: "Invalid input. Please check the area and try again.",
        errors: CreateGymAreaPresenter.formatErrors(error),
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
        message: "This gym no longer exists.",
      }),
    presentConflict: (previous) =>
      Effect.succeed({
        ...previous,
        status: "conflict",
        message: "An area with this name already exists in the gym.",
        errors: {
          ...previous.errors,
          name: "Area names must be unique within a gym.",
        },
      }),
    presentUnexpectedError: (previous) =>
      Effect.succeed({
        ...previous,
        status: "error",
        message: "Unable to create this area. Please try again.",
      }),
  })

  static formatErrors = (error: SchemaError) => {
    const { issues } = CreateGymAreaPresenter.toStandardSchema(error.issue)
    const fieldError = (
      field: keyof CreateGymAreaViewModel["fields"]
    ): string =>
      issues.find(({ path }) => path?.[0] === field)?.message ?? ""

    return {
      gymId: fieldError("gymId"),
      name: fieldError("name"),
    } satisfies CreateGymAreaViewModel["errors"]
  }

  static toStandardSchema = SchemaIssue.makeFormatterStandardSchemaV1()
}
