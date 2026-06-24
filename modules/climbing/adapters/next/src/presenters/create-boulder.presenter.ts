import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import type { Boulder } from "@climbing/application"
import type { SchemaError } from "effect/Schema"

import {
  createBoulderForm,
  createBoulderInitialViewModel,
  type CreateBoulderFieldErrorsViewModel,
  type CreateBoulderFieldsViewModel,
  type CreateBoulderFieldViewModel,
  type CreateBoulderViewModel,
} from "../view-models/create-boulder.view-model"

import { formatSchemaIssue, fieldErrorFor } from "../utils/form"

export class CreateBoulderPresenter extends Service<
  CreateBoulderPresenter,
  {
    readonly presentIdle: () => Effect.Effect<CreateBoulderViewModel>

    readonly presentSuccess: (
      prev: CreateBoulderViewModel,
      boulder: Boulder
    ) => Effect.Effect<CreateBoulderViewModel>

    readonly presentInputParseError: (
      prev: CreateBoulderViewModel,
      error: SchemaError
    ) => Effect.Effect<CreateBoulderViewModel>

    readonly presentUnexpectedError: (
      prev: CreateBoulderViewModel
    ) => Effect.Effect<CreateBoulderViewModel>
  }
>()("@climbing/adapters/next/CreateBoulderPresenter") {
  static Live = Layer.succeed(CreateBoulderPresenter, {
    presentIdle: () => Effect.succeed(createBoulderInitialViewModel),

    presentSuccess: (prev, boulder) =>
      Effect.succeed({
        status: "success",
        boulderId: boulder.id,
        name: boulder.name,
        grade: boulder.grade,
        form: createBoulderForm,
        fields: validFieldsFrom(prev),
        fieldErrors: emptyFieldErrors,
      }),

    presentInputParseError: (prev, error) => {
      const { issues } = formatSchemaIssue(error.issue)

      const fieldFor = (
        field: keyof CreateBoulderFieldsViewModel
      ): CreateBoulderFieldViewModel => {
        const message = fieldErrorFor(issues, field)

        return message === ""
          ? { status: "valid", value: prev.fields[field].value }
          : {
              status: "invalid",
              value: prev.fields[field].value,
              error: message,
            }
      }

      return Effect.succeed({
        status: "error",
        error: "Invalid input. Please check your data and try again.",
        form: createBoulderForm,
        fields: {
          name: fieldFor("name"),
          grade: fieldFor("grade"),
          wallAngle: fieldFor("wallAngle"),
          movementStyle: fieldFor("movementStyle"),
        },
        fieldErrors: {
          name: fieldErrorFor(issues, "name"),
          grade: fieldErrorFor(issues, "grade"),
          wallAngle: fieldErrorFor(issues, "wallAngle"),
          movementStyle: fieldErrorFor(issues, "movementStyle"),
        },
      })
    },

    presentUnexpectedError: (prev) =>
      Effect.succeed({
        status: "error",
        error: "Unable to create this boulder. Please try again.",
        form: createBoulderForm,
        fields: validFieldsFrom(prev),
        fieldErrors: emptyFieldErrors,
      }),
  })
}

const emptyFieldErrors: CreateBoulderFieldErrorsViewModel = {
  name: "",
  grade: "",
  wallAngle: "",
  movementStyle: "",
}

const validFieldsFrom = (
  prev: CreateBoulderViewModel
): CreateBoulderFieldsViewModel => ({
  name: { status: "valid", value: prev.fields.name.value },
  grade: { status: "valid", value: prev.fields.grade.value },
  wallAngle: { status: "valid", value: prev.fields.wallAngle.value },
  movementStyle: {
    status: "valid",
    value: prev.fields.movementStyle.value,
  },
})
