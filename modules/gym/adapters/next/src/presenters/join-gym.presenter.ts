import { Effect, Layer, SchemaIssue } from "effect"
import { Service } from "effect/Context"
import type {
  GymMembershipAlreadyExistsError,
  GymNotFoundError,
} from "@gym/application/errors/gym-membership"
import type { JoinGymOutput } from "@gym/application/use-cases/join-gym"
import type { SchemaError } from "effect/Schema"

import {
  joinGymInitialViewModel,
  type JoinGymViewModel,
} from "../view-models/join-gym.view-model"

export class JoinGymPresenter extends Service<
  JoinGymPresenter,
  {
    readonly presentSuccess: (
      success: JoinGymOutput
    ) => Effect.Effect<JoinGymViewModel>
    readonly presentSchemaError: (
      previousState: JoinGymViewModel,
      error: SchemaError
    ) => Effect.Effect<JoinGymViewModel>
    readonly presentNotFoundError: (
      previousState: JoinGymViewModel,
      error: GymNotFoundError
    ) => Effect.Effect<JoinGymViewModel>
    readonly presentAlreadyMemberError: (
      previousState: JoinGymViewModel,
      error: GymMembershipAlreadyExistsError
    ) => Effect.Effect<JoinGymViewModel>
    readonly presentUnexpectedError: (
      previousState: JoinGymViewModel
    ) => Effect.Effect<JoinGymViewModel>
  }
>()("@gym/adapters/next/JoinGymPresenter") {
  static Live = Layer.succeed(JoinGymPresenter, {
    presentSuccess: ({ gym, membership }) =>
      Effect.succeed({
        ...joinGymInitialViewModel,
        status: "success",
        message: `Joined ${gym.name}.`,
        fields: {
          gymId: {
            ...joinGymInitialViewModel.fields.gymId,
            value: membership.gymId,
          },
        },
      }),

    presentSchemaError: (previousState, error) =>
      Effect.succeed({
        ...previousState,
        status: "invalid",
        message: "Invalid gym. Refresh the page and try again.",
        errors: JoinGymPresenter.formatErrors(error),
      }),

    presentNotFoundError: (previousState, _error) =>
      Effect.succeed({
        ...previousState,
        status: "not-found",
        message: "This gym is no longer available.",
      }),

    presentAlreadyMemberError: (previousState, _error) =>
      Effect.succeed({
        ...previousState,
        status: "already-member",
        message: "You have already joined this gym.",
      }),

    presentUnexpectedError: (previousState) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "Unable to join this gym. Please try again.",
      }),
  })

  static formatErrors = (error: SchemaError) => {
    const { issues } = JoinGymPresenter.toStandardSchema(error.issue)
    const gymId =
      issues.find(({ path }) => path?.[0] === "gymId")?.message ?? ""

    return {
      gymId,
    } satisfies JoinGymViewModel["errors"]
  }

  static toStandardSchema = SchemaIssue.makeFormatterStandardSchemaV1()
}
