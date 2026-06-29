import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import type { NoActiveClimbingSessionError } from "@climbing/application/errors/climbing-session"
import type { EndClimbingSessionOutput } from "@climbing/application/use-cases/end-climbing-session"
import type { SchemaError } from "effect/Schema"

import {
  endClimbingSessionInitialViewModel,
  type EndClimbingSessionViewModel,
} from "../view-models/end-climbing-session.view-model"

export class EndClimbingSessionPresenter extends Service<
  EndClimbingSessionPresenter,
  {
    readonly presentSuccess: (
      success: EndClimbingSessionOutput
    ) => Effect.Effect<EndClimbingSessionViewModel>

    readonly presentSchemaError: (
      previousState: EndClimbingSessionViewModel,
      error: SchemaError
    ) => Effect.Effect<EndClimbingSessionViewModel>

    readonly presentNoActiveSession: (
      previousState: EndClimbingSessionViewModel,
      error: NoActiveClimbingSessionError
    ) => Effect.Effect<EndClimbingSessionViewModel>

    readonly presentUnexpectedError: (
      previousState: EndClimbingSessionViewModel
    ) => Effect.Effect<EndClimbingSessionViewModel>
  }
>()("@climbing/adapters/next/EndClimbingSessionPresenter") {
  static Live = Layer.succeed(EndClimbingSessionPresenter, {
    presentSuccess: (session) =>
      Effect.succeed({
        ...endClimbingSessionInitialViewModel,
        status: "success",
        message: "Your climbing session has ended.",
        fields: {
          sessionId: {
            ...endClimbingSessionInitialViewModel.fields.sessionId,
            value: session.id,
          },
          startedAt: {
            ...endClimbingSessionInitialViewModel.fields.startedAt,
            value: session.startedAt.toISOString(),
          },
          endedAt: {
            ...endClimbingSessionInitialViewModel.fields.endedAt,
            value: session.endedAt.toISOString(),
          },
        },
      }),

    presentSchemaError: (previousState, _error) =>
      Effect.succeed({
        ...previousState,
        status: "invalid",
        message: "Invalid input. Please check your data and try again.",
      }),

    presentNoActiveSession: (previousState, _error) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "You do not have an active climbing session to end.",
      }),

    presentUnexpectedError: (previousState) =>
      Effect.succeed({
        ...previousState,
        status: "error",
        message: "Unable to end your climbing session. Please try again.",
      }),
  })
}
