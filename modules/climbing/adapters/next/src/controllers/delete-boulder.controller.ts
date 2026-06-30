import { Effect, Schema } from "effect"
import { DeleteBoulderInputSchema } from "@climbing/application/use-cases/delete-boulder"
import { Climbing } from "@climbing/component"
import { Headers, Navigation } from "@packages/effect-next"

import { DeleteBoulderPresenter } from "../presenters/delete-boulder.presenter"
import type { DeleteBoulderViewModel } from "../view-models/delete-boulder.view-model"

export const DeleteBoulderController = Effect.fn(
  "DeleteBoulderController.make"
)(function* ({
  previousState,
  redirectUrl,
}: {
  previousState: DeleteBoulderViewModel
  redirectUrl: string
}) {
  const climbing = yield* Climbing
  const cookies = yield* Headers.Cookies
  const presenter = yield* DeleteBoulderPresenter
  const redirectToSignIn = Navigation.Redirect(redirectUrl)

  return {
    handle: Effect.fn("DeleteBoulderController.handle")(
      function* (formData: FormData) {
        const authToken = cookies.get("authToken")

        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const input = yield* Schema.decodeUnknownEffect(
          DeleteBoulderInputSchema
        )(
          {
            token: authToken.value,
            ...Object.fromEntries(formData),
          },
          { errors: "all" }
        )

        const success = yield* climbing.deleteBoulder(input)

        return yield* presenter.presentSuccess(success)
      },
      Effect.catchTags({
        SchemaError: (error) =>
          presenter.presentSchemaError(previousState, error),
        UnauthenticatedClimberError: () => redirectToSignIn,
        CreatedBoulderNotFoundError: (error) =>
          presenter.presentCreatedBoulderNotFound(previousState, error),
        UnauthorizedToDeleteBoulderError: (error) =>
          presenter.presentUnauthorizedToDeleteBoulder(previousState, error),
      }),
      Effect.catchDefect(() => presenter.presentUnexpectedError(previousState))
    ),
  }
})
