import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import type { ActiveClimbingSession } from "@climbing/application/models/climbing-session"

export type StartClimbingSessionViewModel =
  | {
      readonly status: "idle"
    }
  | {
      readonly status: "success"
      readonly sessionId: string
      readonly startedAt: string
    }
  | {
      readonly status: "error"
      readonly error: string
    }

export class StartClimbingSessionPresenter extends Service<
  StartClimbingSessionPresenter,
  {
    readonly presentSuccess: (
      session: ActiveClimbingSession
    ) => Effect.Effect<StartClimbingSessionViewModel>
    readonly presentUnexpectedError: () => Effect.Effect<StartClimbingSessionViewModel>
  }
>()("@climbing/adapters/next/StartClimbingSessionPresenter") {
  static Live = Layer.succeed(StartClimbingSessionPresenter, {
    presentSuccess: (session) =>
      Effect.succeed({
        status: "success",
        sessionId: session.id,
        startedAt: session.startedAt.toISOString(),
      }),
    presentUnexpectedError: () =>
      Effect.succeed({
        status: "error",
        error: "Unable to start your climbing session. Please try again.",
      }),
  })
}
