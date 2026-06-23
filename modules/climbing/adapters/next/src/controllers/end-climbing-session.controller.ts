import { Effect } from "effect"
import { Climbing } from "@climbing/component"
import { Headers, Navigation } from "@packages/effect-next"

import {
  EndClimbingSessionPresenter,
  type EndClimbingSessionViewModel,
} from "../presenters/end-climbing-session.presenter"

export const EndClimbingSessionController = Effect.fn(
  "EndClimbingSessionController.make"
)(function* ({
  previousState: _previousState,
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
      function* () {
        const authToken = cookies.get("authToken")

        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const session = yield* climbing.endClimbingSession({
          token: authToken.value,
        })

        return yield* presenter.presentSuccess(session)
      },
      Effect.catchTags({
        SchemaError: () => redirectToSignIn,
        UnauthenticatedClimberError: () => redirectToSignIn,
        NoActiveClimbingSessionError: () => presenter.presentNoActiveSession(),
      })
    ),
  }
})
