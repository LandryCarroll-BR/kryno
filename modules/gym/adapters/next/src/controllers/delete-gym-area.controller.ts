import { Effect, Schema } from "effect"
import { DeleteGymAreaInputSchema } from "@gym/application/use-cases/delete-gym-area"
import { Gym } from "@gym/component"
import { Headers, Navigation } from "@packages/effect-next"

import { DeleteGymAreaPresenter } from "../presenters/delete-gym-area.presenter"
import type { DeleteGymAreaViewModel } from "../view-models/delete-gym-area.view-model"

export const DeleteGymAreaController = Effect.fn(
  "DeleteGymAreaController.make"
)(function* ({
  previousState,
  redirectUrl,
}: {
  previousState: DeleteGymAreaViewModel
  redirectUrl: string
}) {
  const gym = yield* Gym
  const cookies = yield* Headers.Cookies
  const presenter = yield* DeleteGymAreaPresenter
  const redirectToSignIn = Navigation.Redirect(redirectUrl)

  return {
    handle: Effect.fn("DeleteGymAreaController.handle")(
      function* (formData: FormData) {
        const authToken = cookies.get("authToken")
        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const input = yield* Schema.decodeUnknownEffect(
          DeleteGymAreaInputSchema
        )(
          {
            token: authToken.value,
            ...Object.fromEntries(formData),
          },
          { errors: "all" }
        )
        const success = yield* gym.deleteGymArea(input)
        return yield* presenter.presentSuccess(success)
      },
      Effect.catchTags({
        SchemaError: (error) =>
          presenter.presentSchemaError(previousState, error),
        UnauthenticatedGymAdministratorError: () => redirectToSignIn,
        UnauthorizedGymAdministratorError: () =>
          presenter.presentForbidden(previousState),
        GymNotFoundError: () => presenter.presentNotFound(previousState),
        GymAreaNotFoundError: () =>
          presenter.presentNotFound(previousState),
      }),
      Effect.catchDefect(() =>
        presenter.presentUnexpectedError(previousState)
      )
    ),
  }
})
