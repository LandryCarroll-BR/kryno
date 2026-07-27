import { Effect, Layer, SchemaIssue } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"
import type { LogGymRouteAttemptOutput } from "@gym/application/use-cases/log-gym-route-attempt"

import {
  logGymRouteAttemptInitialViewModel,
  type LogGymRouteAttemptViewModel,
} from "../view-models/log-gym-route-attempt.view-model"

export class LogGymRouteAttemptPresenter extends Service<
  LogGymRouteAttemptPresenter,
  {
    readonly presentSuccess: (
      success: LogGymRouteAttemptOutput
    ) => Effect.Effect<LogGymRouteAttemptViewModel>
    readonly presentSchemaError: (
      previous: LogGymRouteAttemptViewModel,
      error: SchemaError
    ) => Effect.Effect<LogGymRouteAttemptViewModel>
    readonly presentMembershipRequired: (
      previous: LogGymRouteAttemptViewModel
    ) => Effect.Effect<LogGymRouteAttemptViewModel>
    readonly presentRouteNotFound: (
      previous: LogGymRouteAttemptViewModel
    ) => Effect.Effect<LogGymRouteAttemptViewModel>
    readonly presentBoulderUnavailable: (
      previous: LogGymRouteAttemptViewModel
    ) => Effect.Effect<LogGymRouteAttemptViewModel>
    readonly presentNoActiveSession: (
      previous: LogGymRouteAttemptViewModel
    ) => Effect.Effect<LogGymRouteAttemptViewModel>
    readonly presentUnexpectedError: (
      previous: LogGymRouteAttemptViewModel
    ) => Effect.Effect<LogGymRouteAttemptViewModel>
  }
>()("@gym/adapters/next/LogGymRouteAttemptPresenter") {
  static Live = Layer.succeed(LogGymRouteAttemptPresenter, {
    presentSuccess: ({ gymId, routeId, attempt }) =>
      Effect.succeed({
        ...logGymRouteAttemptInitialViewModel,
        status: "success",
        message: `Logged attempt ${attempt.ordinal}.`,
        fields: {
          ...logGymRouteAttemptInitialViewModel.fields,
          gymId: {
            ...logGymRouteAttemptInitialViewModel.fields.gymId,
            value: gymId,
          },
          routeId: {
            ...logGymRouteAttemptInitialViewModel.fields.routeId,
            value: routeId,
          },
          attemptId: {
            ...logGymRouteAttemptInitialViewModel.fields.attemptId,
            value: attempt.id,
          },
          outcome: {
            ...logGymRouteAttemptInitialViewModel.fields.outcome,
            value: attempt.outcome,
          },
          moveTypes: {
            ...logGymRouteAttemptInitialViewModel.fields.moveTypes,
            value: attempt.moveTypes.join(","),
          },
          ordinal: {
            ...logGymRouteAttemptInitialViewModel.fields.ordinal,
            value: String(attempt.ordinal),
          },
        },
      }),
    presentSchemaError: (previous, error) =>
      Effect.succeed({
        ...previous,
        status: "invalid",
        message: "Choose a route and attempt outcome.",
        errors: LogGymRouteAttemptPresenter.formatErrors(error),
      }),
    presentMembershipRequired: (previous) =>
      Effect.succeed({
        ...previous,
        status: "forbidden",
        message: "Join this gym before logging its boulders.",
      }),
    presentRouteNotFound: (previous) =>
      Effect.succeed({
        ...previous,
        status: "not-found",
        message: "That route is no longer available at this gym.",
      }),
    presentBoulderUnavailable: (previous) =>
      Effect.succeed({
        ...previous,
        status: "not-found",
        message: "That boulder is no longer available.",
      }),
    presentNoActiveSession: (previous) =>
      Effect.succeed({
        ...previous,
        status: "error",
        message: "Start a climbing session before logging attempts.",
      }),
    presentUnexpectedError: (previous) =>
      Effect.succeed({
        ...previous,
        status: "error",
        message: "Unable to log this attempt. Please try again.",
      }),
  })

  static formatErrors = (error: SchemaError) => {
    const { issues } = LogGymRouteAttemptPresenter.toStandardSchema(
      error.issue
    )
    const fieldError = (
      field: keyof LogGymRouteAttemptViewModel["fields"]
    ): string =>
      issues.find(({ path }) => path?.[0] === field)?.message ?? ""

    return {
      gymId: fieldError("gymId"),
      routeId: fieldError("routeId"),
      attemptId: fieldError("attemptId"),
      outcome: fieldError("outcome"),
      moveTypes: fieldError("moveTypes"),
      ordinal: fieldError("ordinal"),
    } satisfies LogGymRouteAttemptViewModel["errors"]
  }

  static toStandardSchema = SchemaIssue.makeFormatterStandardSchemaV1()
}
