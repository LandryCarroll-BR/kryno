import { Effect } from "effect"
import { Climbing } from "@climbing/component"
import { Headers, Navigation } from "@packages/effect-next"

import {
  StartClimbingSessionPresenter,
  type StartClimbingSessionViewModel,
} from "../presenters/start-climbing-session.presenter"

export const StartClimbingSessionController = Effect.fn(
  "StartClimbingSessionController.make"
)(function* ({
  previousState: _previousState,
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
      function* () {
        const authToken = cookies.get("authToken")

        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const session = yield* climbing.startClimbingSession({
          token: authToken.value,
        })

        return yield* presenter.presentSuccess(session)
      },
      Effect.catchTags({
        SchemaError: () => redirectToSignIn,
        UnauthenticatedClimberError: () => redirectToSignIn,
      })
    ),
  }
})
