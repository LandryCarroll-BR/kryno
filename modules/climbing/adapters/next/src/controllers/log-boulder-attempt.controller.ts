import { Effect, Schema } from "effect"
import { LogBoulderAttemptInputSchema } from "@climbing/application/use-cases/log-boulder-attempt"
import { Climbing } from "@climbing/component"
import { Headers, Navigation } from "@packages/effect-next"

import {
  LogBoulderAttemptPresenter,
  type LogBoulderAttemptViewModel,
} from "../presenters/log-boulder-attempt.presenter"

const getString = (formData: FormData, name: string): string => {
  const value = formData.get(name)
  return typeof value === "string" ? value : ""
}

const decodeInput = (token: string, formData: FormData) =>
  Schema.decodeUnknownEffect(LogBoulderAttemptInputSchema)(
    {
      token,
      boulderId: getString(formData, "boulderId"),
      outcome: getString(formData, "outcome"),
    },
    { errors: "all" }
  )

export const LogBoulderAttemptController = Effect.fn(
  "LogBoulderAttemptController.make"
)(function* ({
  previousState: _previousState,
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

        const input = yield* decodeInput(authToken.value, formData)
        const attempt = yield* climbing.logBoulderAttempt(input)

        return yield* presenter.presentSuccess(attempt)
      },
      Effect.catchTags({
        SchemaError: () => presenter.presentValidationError(),
        UnauthenticatedClimberError: () => redirectToSignIn,
        NoActiveClimbingSessionError: () => presenter.presentNoActiveSession(),
        SavedBoulderNotFoundError: () =>
          presenter.presentSavedBoulderNotFound(),
      })
    ),
  }
})
