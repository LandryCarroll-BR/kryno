import { Effect, Layer, SchemaIssue } from "effect"
import { Service } from "effect/Context"
import type { SavedBoulderNotFoundError } from "@climbing/application/errors/boulder"
import type { NoActiveClimbingSessionError } from "@climbing/application/errors/climbing-session"
import type { LogBoulderAttemptOutput } from "@climbing/application/use-cases/log-boulder-attempt"
import type { SchemaError } from "effect/Schema"

import {
  logBoulderAttemptInitialViewModel,
  type LogBoulderAttemptViewModel,
} from "../view-models/log-boulder-attempt.view-model"

export class LogBoulderAttemptPresenter extends Service<
  LogBoulderAttemptPresenter,
  {
    readonly presentSuccess: (
      success: LogBoulderAttemptOutput
    ) => Effect.Effect<LogBoulderAttemptViewModel>

    readonly presentSchemaError: (
      previousState: LogBoulderAttemptViewModel,
      error: SchemaError
    ) => Effect.Effect<LogBoulderAttemptViewModel>

    readonly presentNoActiveSession: (
      previousState: LogBoulderAttemptViewModel,
      error: NoActiveClimbingSessionError
    ) => Effect.Effect<LogBoulderAttemptViewModel>

    readonly presentSavedBoulderNotFound: (
      previousState: LogBoulderAttemptViewModel,
      error: SavedBoulderNotFoundError
    ) => Effect.Effect<LogBoulderAttemptViewModel>

    readonly presentUnexpectedError: (
      previousState: LogBoulderAttemptViewModel
    ) => Effect.Effect<LogBoulderAttemptViewModel>
  }
>()("@climbing/adapters/next/LogBoulderAttemptPresenter") {
  static Live = Layer.succeed(LogBoulderAttemptPresenter, {
    presentSuccess: (attempt) =>
      Effect.succeed({
        ...logBoulderAttemptInitialViewModel,
        status: "success",
        message: `Logged attempt ${attempt.ordinal}.`,
        fields: {
          attemptId: {
            ...logBoulderAttemptInitialViewModel.fields.attemptId,
            value: attempt.id,
          },
          boulderId: {
            ...logBoulderAttemptInitialViewModel.fields.boulderId,
            value: attempt.boulderId,
          },
          outcome: {
            ...logBoulderAttemptInitialViewModel.fields.outcome,
            value: attempt.outcome,
          },
          ordinal: {
            ...logBoulderAttemptInitialViewModel.fields.ordinal,
            value: String(attempt.ordinal),
          },
        },
      }),

    presentSchemaError: (previousState, error) =>
      Effect.succeed({
        ...previousState,
        status: "invalid",
        message: "Choose a boulder and attempt outcome.",
        errors: LogBoulderAttemptPresenter.formatErrors(error),
      }),

    presentNoActiveSession: (previousState, _error) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "Start a climbing session before logging attempts.",
      }),

    presentSavedBoulderNotFound: (previousState, _error) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "That boulder is not available in your saved boulders.",
      }),

    presentUnexpectedError: (previousState) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "Unable to log this attempt. Please try again.",
      }),
  })

  static formatErrors = (error: SchemaError) => {
    const { issues } = LogBoulderAttemptPresenter.toStandardSchema(error.issue)

    const fieldError = (
      field: keyof LogBoulderAttemptViewModel["fields"]
    ): string => issues.find(({ path }) => path?.[0] === field)?.message ?? ""

    return {
      attemptId: fieldError("attemptId"),
      boulderId: fieldError("boulderId"),
      outcome: fieldError("outcome"),
      ordinal: fieldError("ordinal"),
    } satisfies LogBoulderAttemptViewModel["errors"]
  }

  static toStandardSchema = SchemaIssue.makeFormatterStandardSchemaV1()
}
