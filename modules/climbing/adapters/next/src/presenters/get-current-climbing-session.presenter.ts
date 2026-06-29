import { Effect, Layer, Option } from "effect"
import { Service } from "effect/Context"
import type { GetCurrentClimbingSessionOutput } from "@climbing/application/use-cases/get-current-climbing-session"
import type { SchemaError } from "effect/Schema"

import {
  getCurrentClimbingSessionInitialViewModel,
  type GetCurrentClimbingSessionViewModel,
} from "../view-models/get-current-climbing-session.view-model"

export class GetCurrentClimbingSessionPresenter extends Service<
  GetCurrentClimbingSessionPresenter,
  {
    readonly presentSuccess: (
      success: GetCurrentClimbingSessionOutput
    ) => Effect.Effect<GetCurrentClimbingSessionViewModel>

    readonly presentSchemaError: (
      error: SchemaError
    ) => Effect.Effect<GetCurrentClimbingSessionViewModel>

    readonly presentUnexpectedError: () => Effect.Effect<GetCurrentClimbingSessionViewModel>
  }
>()("@climbing/adapters/next/GetCurrentClimbingSessionPresenter") {
  static Live = Layer.succeed(GetCurrentClimbingSessionPresenter, {
    presentSuccess: (session) =>
      Effect.succeed(
        Option.match(session, {
          onNone: () => getCurrentClimbingSessionInitialViewModel,
          onSome: (activeSession) => ({
            ...getCurrentClimbingSessionInitialViewModel,
            status: "success",
            message: "Your climbing session is in progress.",
            fields: {
              sessionId: {
                ...getCurrentClimbingSessionInitialViewModel.fields.sessionId,
                value: activeSession.id,
              },
              startedAt: {
                ...getCurrentClimbingSessionInitialViewModel.fields.startedAt,
                value: activeSession.startedAt.toISOString(),
              },
            },
          }),
        })
      ),

    presentSchemaError: (_error) =>
      Effect.succeed({
        ...getCurrentClimbingSessionInitialViewModel,
        status: "invalid",
        message: "Invalid input. Please check your data and try again.",
      }),

    presentUnexpectedError: () =>
      Effect.succeed({
        ...getCurrentClimbingSessionInitialViewModel,
        status: "error",
        message:
          "Unable to load your current climbing session. Please try again.",
      }),
  })
}
