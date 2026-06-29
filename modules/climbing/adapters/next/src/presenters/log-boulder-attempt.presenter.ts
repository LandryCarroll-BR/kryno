import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import type { ClimbingAttempt } from "@climbing/application/models/climbing-attempt"

export type LogBoulderAttemptViewModel =
  | {
      readonly status: "idle"
    }
  | {
      readonly status: "success"
      readonly attemptId: string
      readonly boulderId: string
      readonly outcome: string
      readonly ordinal: number
    }
  | {
      readonly status: "error"
      readonly error: string
    }

export class LogBoulderAttemptPresenter extends Service<
  LogBoulderAttemptPresenter,
  {
    readonly presentSuccess: (
      attempt: ClimbingAttempt
    ) => Effect.Effect<LogBoulderAttemptViewModel>
    readonly presentValidationError: () => Effect.Effect<LogBoulderAttemptViewModel>
    readonly presentNoActiveSession: () => Effect.Effect<LogBoulderAttemptViewModel>
    readonly presentSavedBoulderNotFound: () => Effect.Effect<LogBoulderAttemptViewModel>
  }
>()("@climbing/adapters/next/LogBoulderAttemptPresenter") {
  static Live = Layer.succeed(LogBoulderAttemptPresenter, {
    presentSuccess: (attempt) =>
      Effect.succeed({
        status: "success",
        attemptId: attempt.id,
        boulderId: attempt.boulderId,
        outcome: attempt.outcome,
        ordinal: attempt.ordinal,
      }),

    presentValidationError: () =>
      Effect.succeed({
        status: "error",
        error: "Choose a boulder and attempt outcome.",
      }),

    presentNoActiveSession: () =>
      Effect.succeed({
        status: "error",
        error: "Start a climbing session before logging attempts.",
      }),

    presentSavedBoulderNotFound: () =>
      Effect.succeed({
        status: "error",
        error: "That boulder is not available in your saved boulders.",
      }),
  })
}
