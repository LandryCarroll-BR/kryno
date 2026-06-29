import { Effect, Schema } from "effect"
import { GetCurrentClimbingSessionInputSchema } from "@climbing/application/use-cases/get-current-climbing-session"
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

        const input = yield* Schema.decodeUnknownEffect(
          GetCurrentClimbingSessionInputSchema
        )(
          {
            token: authToken.value,
          },
          { errors: "all" }
        )

        const success = yield* climbing.getCurrentClimbingSession(input)

        return yield* presenter.presentSuccess(success)
      },
      Effect.catchTags({
        SchemaError: (error) => presenter.presentSchemaError(error),
        UnauthenticatedClimberError: () => redirectToSignIn,
      }),
      Effect.catchDefect(() => presenter.presentUnexpectedError())
    ),
  }
})
