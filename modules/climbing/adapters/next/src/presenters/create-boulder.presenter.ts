import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import type { Boulder } from "@climbing/application"
import type { SchemaError } from "effect/Schema"

import {
  createBoulderInitialViewModel,
  type CreateBoulderViewModel,
} from "../view-models/create-boulder.view-model"

import { fieldErrorFor, formatSchemaIssue } from "../utils/form"

export class CreateBoulderPresenter extends Service<
  CreateBoulderPresenter,
  {
    readonly presentIdle: () => Effect.Effect<CreateBoulderViewModel>

    readonly presentSuccess: (
      fields: CreateBoulderViewModel["fields"],
      boulder: Boulder
    ) => Effect.Effect<CreateBoulderViewModel>

    readonly presentInputParseError: (
      fields: CreateBoulderViewModel["fields"],
      error: SchemaError
    ) => Effect.Effect<CreateBoulderViewModel>

    readonly presentUnexpectedError: (
      fields: CreateBoulderViewModel["fields"]
    ) => Effect.Effect<CreateBoulderViewModel>
  }
>()("@climbing/adapters/next/CreateBoulderPresenter") {
  static Live = Layer.succeed(CreateBoulderPresenter, {
    presentIdle: () => Effect.succeed(createBoulderInitialViewModel),

    presentSuccess: (fields, boulder) =>
      Effect.succeed({
        status: "success",
        message: `Created ${boulder.name} at ${boulder.grade}.`,
        fields: clearFieldErrors(fields),
      }),

    presentInputParseError: (fields, error) => {
      const { issues } = formatSchemaIssue(error.issue)

      return Effect.succeed({
        status: "idle",
        message: "Invalid input. Please check your data and try again.",
        fields: {
          name: {
            ...fields.name,
            error: fieldErrorFor(issues, "name"),
          },
          grade: {
            ...fields.grade,
            error: fieldErrorFor(issues, "grade"),
          },
          wallAngle: {
            ...fields.wallAngle,
            error: fieldErrorFor(issues, "wallAngle"),
          },
          movementStyle: {
            ...fields.movementStyle,
            error: fieldErrorFor(issues, "movementStyle"),
          },
        },
      })
    },

    presentUnexpectedError: (fields) =>
      Effect.succeed({
        status: "idle",
        message: "Unable to create this boulder. Please try again.",
        fields: clearFieldErrors(fields),
      }),
  })
}

const clearFieldErrors = (
  fields: CreateBoulderViewModel["fields"]
): CreateBoulderViewModel["fields"] => ({
  name: { ...fields.name, error: "" },
  grade: { ...fields.grade, error: "" },
  wallAngle: { ...fields.wallAngle, error: "" },
  movementStyle: { ...fields.movementStyle, error: "" },
})
