import { Effect, Schema } from "effect"
import { StartClimbingSessionInputSchema } from "@climbing/application/use-cases/start-climbing-session"
import { Climbing } from "@climbing/component"
import { Headers, Navigation } from "@packages/effect-next"

import { StartClimbingSessionPresenter } from "../presenters/start-climbing-session.presenter"
import { type StartClimbingSessionViewModel } from "../view-models/start-climbing-session.view-model"

export const StartClimbingSessionController = Effect.fn(
  "StartClimbingSessionController.make"
)(function* ({
  previousState,
  redirectUrl,
}: {
  previousState: StartClimbingSessionViewModel
  redirectUrl: string
}) {
  const climbing = yield* Climbing
  const cookies = yield* Headers.Cookies
  const presenter = yield* StartClimbingSessionPresenter
  const redirectToSignIn = Navigation.Redirect(redirectUrl)

  return {
    handle: Effect.fn("StartClimbingSessionController.handle")(
      function* (formData: FormData) {
        const authToken = cookies.get("authToken")

        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const input = yield* Schema.decodeUnknownEffect(
          StartClimbingSessionInputSchema
        )(
          {
            token: authToken.value,
            ...Object.fromEntries(formData),
          },
          { errors: "all" }
        )

        const success = yield* climbing.startClimbingSession(input)

        return yield* presenter.presentSuccess(success)
      },
      Effect.catchTags({
        SchemaError: (error) =>
          presenter.presentSchemaError(previousState, error),
        UnauthenticatedClimberError: () => redirectToSignIn,
      }),
      Effect.catchDefect(() => presenter.presentUnexpectedError(previousState))
    ),
  }
})
