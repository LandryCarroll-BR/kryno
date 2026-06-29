import { Effect, Schema } from "effect"
import { EndClimbingSessionInputSchema } from "@climbing/application/use-cases/end-climbing-session"
import { Climbing } from "@climbing/component"
import { Headers, Navigation } from "@packages/effect-next"

import { EndClimbingSessionPresenter } from "../presenters/end-climbing-session.presenter"
import { type EndClimbingSessionViewModel } from "../view-models/end-climbing-session.view-model"

export const EndClimbingSessionController = Effect.fn(
  "EndClimbingSessionController.make"
)(function* ({
  previousState,
  redirectUrl,
}: {
  previousState: EndClimbingSessionViewModel
  redirectUrl: string
}) {
  const climbing = yield* Climbing
  const cookies = yield* Headers.Cookies
  const presenter = yield* EndClimbingSessionPresenter
  const redirectToSignIn = Navigation.Redirect(redirectUrl)

  return {
    handle: Effect.fn("EndClimbingSessionController.handle")(
      function* (formData: FormData) {
        const authToken = cookies.get("authToken")

        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const input = yield* Schema.decodeUnknownEffect(
          EndClimbingSessionInputSchema
        )(
          {
            token: authToken.value,
            ...Object.fromEntries(formData),
          },
          { errors: "all" }
        )

        const success = yield* climbing.endClimbingSession(input)

        return yield* presenter.presentSuccess(success)
      },
      Effect.catchTags({
        SchemaError: (error) =>
          presenter.presentSchemaError(previousState, error),
        UnauthenticatedClimberError: () => redirectToSignIn,
        NoActiveClimbingSessionError: (error) =>
          presenter.presentNoActiveSession(previousState, error),
      }),
      Effect.catchDefect(() => presenter.presentUnexpectedError(previousState))
    ),
  }
})
