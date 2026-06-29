import { Effect, Layer, SchemaIssue } from "effect"
import { Service } from "effect/Context"
import type { CreateBoulderOutput } from "@climbing/application/use-cases/create-boulder"
import type { SchemaError } from "effect/Schema"

import {
  createBoulderInitialViewModel,
  type CreateBoulderViewModel,
} from "../view-models/create-boulder.view-model"

export class CreateBoulderPresenter extends Service<
  CreateBoulderPresenter,
  {
    readonly presentSuccess: (
      success: CreateBoulderOutput
    ) => Effect.Effect<CreateBoulderViewModel>

    readonly presentSchemaError: (
      previousState: CreateBoulderViewModel,
      error: SchemaError
    ) => Effect.Effect<CreateBoulderViewModel>

    readonly presentUnexpectedError: (
      previousState: CreateBoulderViewModel
    ) => Effect.Effect<CreateBoulderViewModel>
  }
>()("@climbing/adapters/next/CreateBoulderPresenter") {
  static Live = Layer.succeed(CreateBoulderPresenter, {
    presentSuccess: (boulder) =>
      Effect.succeed({
        ...createBoulderInitialViewModel,
        status: "success",
        message: `Created ${boulder.name} at ${boulder.grade}.`,
      }),

    presentSchemaError: (previousState, error) => {
      return Effect.succeed({
        ...previousState,
        status: "invalid",
        message: "Invalid input. Please check your data and try again.",
        errors: CreateBoulderPresenter.formatErrors(error),
      })
    },

    presentUnexpectedError: (previousState) => {
      return Effect.succeed({
        ...previousState,
        status: "error",
        message: "An unexptected Error has occcured. Please try again later.",
      })
    },
  })

  static formatErrors = (error: SchemaError) => {
    const { issues } = CreateBoulderPresenter.toStandardSchema(error.issue)

    const fieldError = (
      field: keyof CreateBoulderViewModel["fields"]
    ): string => issues.find(({ path }) => path?.[0] === field)?.message ?? ""

    return {
      name: fieldError("name"),
      grade: fieldError("grade"),
      wallAngle: fieldError("wallAngle"),
      movementStyle: fieldError("movementStyle"),
    } satisfies CreateBoulderViewModel["errors"]
  }

  static toStandardSchema = SchemaIssue.makeFormatterStandardSchemaV1()
}
