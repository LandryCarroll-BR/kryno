import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import type { CompletedClimbingSession } from "@climbing/application/models/climbing-session"

export type EndClimbingSessionViewModel =
  | {
      readonly status: "idle"
    }
  | {
      readonly status: "active"
      readonly sessionId: string
      readonly startedAt: string
    }
  | {
      readonly status: "ended"
      readonly sessionId: string
      readonly endedAt: string
    }
  | {
      readonly status: "error"
      readonly error: string
    }

export class EndClimbingSessionPresenter extends Service<
  EndClimbingSessionPresenter,
  {
    readonly presentSuccess: (
      session: CompletedClimbingSession
    ) => Effect.Effect<EndClimbingSessionViewModel>
    readonly presentNoActiveSession: () => Effect.Effect<EndClimbingSessionViewModel>
    readonly presentUnexpectedError: () => Effect.Effect<EndClimbingSessionViewModel>
  }
>()("@climbing/adapters/next/EndClimbingSessionPresenter") {
  static Live = Layer.succeed(EndClimbingSessionPresenter, {
    presentSuccess: (session) =>
      Effect.succeed({
        status: "ended",
        sessionId: session.id,
        endedAt: session.endedAt.toISOString(),
      }),

    presentNoActiveSession: () =>
      Effect.succeed({
        status: "error",
        error: "You do not have an active climbing session to end.",
      }),

    presentUnexpectedError: () =>
      Effect.succeed({
        status: "error",
        error: "Unable to end your climbing session. Please try again.",
      }),
  })
}
