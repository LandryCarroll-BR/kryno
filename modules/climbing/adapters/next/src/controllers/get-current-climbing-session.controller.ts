import { Effect } from "effect"
import { Climbing } from "@climbing/component"
import { Headers, Navigation } from "@packages/effect-next"

import { GetCurrentClimbingSessionPresenter } from "../presenters/get-current-climbing-session.presenter"

export const GetCurrentClimbingSessionController = Effect.fn(
  "GetCurrentClimbingSessionController.make"
)(function* ({ redirectUrl }: { redirectUrl: string }) {
  const climbing = yield* Climbing
  const cookies = yield* Headers.Cookies
  const presenter = yield* GetCurrentClimbingSessionPresenter

  const redirectToSignIn = Navigation.Redirect(redirectUrl)

  return {
    handle: Effect.fn("GetCurrentClimbingSessionController.handle")(
      function* () {
        const authToken = cookies.get("authToken")

        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const session = yield* climbing.getCurrentClimbingSession({
          token: authToken.value,
        })

        return yield* presenter.present(session)
      },
      Effect.catchTags({
        SchemaError: () => redirectToSignIn,
        UnauthenticatedClimberError: () => redirectToSignIn,
      })
    ),
  }
})
