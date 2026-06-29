import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import type { StartClimbingSessionOutput } from "@climbing/application/use-cases/start-climbing-session"
import type { SchemaError } from "effect/Schema"

import {
  startClimbingSessionInitialViewModel,
  type StartClimbingSessionViewModel,
} from "../view-models/start-climbing-session.view-model"

export class StartClimbingSessionPresenter extends Service<
  StartClimbingSessionPresenter,
  {
    readonly presentSuccess: (
      success: StartClimbingSessionOutput
    ) => Effect.Effect<StartClimbingSessionViewModel>

    readonly presentSchemaError: (
      previousState: StartClimbingSessionViewModel,
      error: SchemaError
    ) => Effect.Effect<StartClimbingSessionViewModel>

    readonly presentUnexpectedError: (
      previousState: StartClimbingSessionViewModel
    ) => Effect.Effect<StartClimbingSessionViewModel>
  }
>()("@climbing/adapters/next/StartClimbingSessionPresenter") {
  static Live = Layer.succeed(StartClimbingSessionPresenter, {
    presentSuccess: (session) =>
      Effect.succeed({
        ...startClimbingSessionInitialViewModel,
        status: "success",
        message: "Your climbing session is active.",
        fields: {
          sessionId: {
            ...startClimbingSessionInitialViewModel.fields.sessionId,
            value: session.id,
          },
          startedAt: {
            ...startClimbingSessionInitialViewModel.fields.startedAt,
            value: session.startedAt.toISOString(),
          },
        },
      }),

    presentSchemaError: (previousState, _error) =>
      Effect.succeed({
        ...previousState,
        status: "invalid",
        message: "Invalid input. Please check your data and try again.",
      }),

    presentUnexpectedError: (previousState) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "Unable to start your climbing session. Please try again.",
      }),
  })
}
