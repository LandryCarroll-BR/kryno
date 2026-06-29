import { Effect, Schema } from "effect"
import { LogBoulderAttemptInputSchema } from "@climbing/application/use-cases/log-boulder-attempt"
import { Climbing } from "@climbing/component"
import { Headers, Navigation } from "@packages/effect-next"

import { LogBoulderAttemptPresenter } from "../presenters/log-boulder-attempt.presenter"
import { type LogBoulderAttemptViewModel } from "../view-models/log-boulder-attempt.view-model"

export const LogBoulderAttemptController = Effect.fn(
  "LogBoulderAttemptController.make"
)(function* ({
  previousState,
  redirectUrl,
}: {
  previousState: LogBoulderAttemptViewModel
  redirectUrl: string
}) {
  const climbing = yield* Climbing
  const cookies = yield* Headers.Cookies
  const presenter = yield* LogBoulderAttemptPresenter
  const redirectToSignIn = Navigation.Redirect(redirectUrl)

  return {
    handle: Effect.fn("LogBoulderAttemptController.handle")(
      function* (formData: FormData) {
        const authToken = cookies.get("authToken")

        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const input = yield* Schema.decodeUnknownEffect(
          LogBoulderAttemptInputSchema
        )(
          {
            token: authToken.value,
            ...Object.fromEntries(formData),
          },
          { errors: "all" }
        )

        const success = yield* climbing.logBoulderAttempt(input)

        return yield* presenter.presentSuccess(success)
      },
      Effect.catchTags({
        SchemaError: (error) =>
          presenter.presentSchemaError(previousState, error),
        UnauthenticatedClimberError: () => redirectToSignIn,
        NoActiveClimbingSessionError: (error) =>
          presenter.presentNoActiveSession(previousState, error),
        SavedBoulderNotFoundError: (error) =>
          presenter.presentSavedBoulderNotFound(previousState, error),
      }),
      Effect.catchDefect(() => presenter.presentUnexpectedError(previousState))
    ),
  }
})
