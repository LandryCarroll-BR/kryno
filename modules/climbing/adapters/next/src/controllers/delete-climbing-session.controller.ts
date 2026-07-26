import { Effect, Schema } from "effect"
import { DeleteClimbingSessionInputSchema } from "@climbing/application/use-cases/delete-climbing-session"
import { Climbing } from "@climbing/component"
import { Headers, Navigation } from "@packages/effect-next"

import { DeleteClimbingSessionPresenter } from "../presenters/delete-climbing-session.presenter"
import type { DeleteClimbingSessionViewModel } from "../view-models/delete-climbing-session.view-model"

export const DeleteClimbingSessionController = Effect.fn(
  "DeleteClimbingSessionController.make"
)(function* ({
  previousState,
  redirectUrl,
}: {
  previousState: DeleteClimbingSessionViewModel
  redirectUrl: string
}) {
  const climbing = yield* Climbing
  const cookies = yield* Headers.Cookies
  const presenter = yield* DeleteClimbingSessionPresenter
  const redirectToSignIn = Navigation.Redirect(redirectUrl)

  return {
    handle: Effect.fn("DeleteClimbingSessionController.handle")(
      function* (formData: FormData) {
        const authToken = cookies.get("authToken")

        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const input = yield* Schema.decodeUnknownEffect(
          DeleteClimbingSessionInputSchema
        )(
          {
            token: authToken.value,
            ...Object.fromEntries(formData),
          },
          { errors: "all" }
        )

        const success = yield* climbing.deleteClimbingSession(input)

        return yield* presenter.presentSuccess(success)
      },
      Effect.catchTags({
        SchemaError: (error) =>
          presenter.presentSchemaError(previousState, error),
        UnauthenticatedClimberError: () => redirectToSignIn,
        PastClimbingSessionNotFoundError: (error) =>
          presenter.presentPastClimbingSessionNotFound(previousState, error),
        ActiveClimbingSessionCannotBeDeletedError: (error) =>
          presenter.presentActiveClimbingSessionCannotBeDeleted(
            previousState,
            error
          ),
      }),
      Effect.catchDefect(() => presenter.presentUnexpectedError(previousState))
    ),
  }
})
