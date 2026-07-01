import { Effect, Layer, SchemaIssue } from "effect"
import { Service } from "effect/Context"
import type { UnauthorizedGymAdministratorError } from "@gym/application/errors/gym"
import type { CreateGymOutput } from "@gym/application/use-cases/create-gym"
import type { SchemaError } from "effect/Schema"

import {
  createGymInitialViewModel,
  type CreateGymViewModel,
} from "../view-models/create-gym.view-model"

export class CreateGymPresenter extends Service<
  CreateGymPresenter,
  {
    readonly presentSuccess: (
      success: CreateGymOutput
    ) => Effect.Effect<CreateGymViewModel>

    readonly presentSchemaError: (
      previousState: CreateGymViewModel,
      error: SchemaError
    ) => Effect.Effect<CreateGymViewModel>

    readonly presentUnauthorizedError: (
      previousState: CreateGymViewModel,
      error: UnauthorizedGymAdministratorError
    ) => Effect.Effect<CreateGymViewModel>

    readonly presentUnexpectedError: (
      previousState: CreateGymViewModel
    ) => Effect.Effect<CreateGymViewModel>
  }
>()("@gym/adapters/next/CreateGymPresenter") {
  static Live = Layer.succeed(CreateGymPresenter, {
    presentSuccess: (gym) =>
      Effect.succeed({
        ...createGymInitialViewModel,
        status: "success",
        message: `Created ${gym.name}.`,
      }),

    presentSchemaError: (previousState, error) =>
      Effect.succeed({
        ...previousState,
        status: "invalid",
        message: "Invalid input. Please check your data and try again.",
        errors: CreateGymPresenter.formatErrors(error),
      }),

    presentUnauthorizedError: (previousState, _error) =>
      Effect.succeed({
        ...previousState,
        status: "forbidden",
        message: "You are not authorized to create gyms.",
      }),

    presentUnexpectedError: (previousState) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "Unable to create this gym. Please try again.",
      }),
  })

  static formatErrors = (error: SchemaError) => {
    const { issues } = CreateGymPresenter.toStandardSchema(error.issue)
    const name = issues.find(({ path }) => path?.[0] === "name")?.message ?? ""

    return {
      name,
    } satisfies CreateGymViewModel["errors"]
  }

  static toStandardSchema = SchemaIssue.makeFormatterStandardSchemaV1()
}
