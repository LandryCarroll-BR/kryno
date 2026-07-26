import { Effect, Schema } from "effect"
import { DeleteGymRouteInputSchema } from "@gym/application/use-cases/delete-gym-route"
import { Gym } from "@gym/component"
import { Headers, Navigation } from "@packages/effect-next"

import { DeleteGymRoutePresenter } from "../presenters/delete-gym-route.presenter"
import type { DeleteGymRouteViewModel } from "../view-models/delete-gym-route.view-model"

export const DeleteGymRouteController = Effect.fn(
  "DeleteGymRouteController.make"
)(function* ({
  previousState,
  redirectUrl,
}: {
  previousState: DeleteGymRouteViewModel
  redirectUrl: string
}) {
  const gym = yield* Gym
  const cookies = yield* Headers.Cookies
  const presenter = yield* DeleteGymRoutePresenter
  const redirectToSignIn = Navigation.Redirect(redirectUrl)

  return {
    handle: Effect.fn("DeleteGymRouteController.handle")(
      function* (formData: FormData) {
        const authToken = cookies.get("authToken")
        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const input = yield* Schema.decodeUnknownEffect(
          DeleteGymRouteInputSchema
        )(
          {
            token: authToken.value,
            ...Object.fromEntries(formData),
          },
          { errors: "all" }
        )
        const success = yield* gym.deleteGymRoute(input)
        return yield* presenter.presentSuccess(success)
      },
      Effect.catchTags({
        SchemaError: (error) =>
          presenter.presentSchemaError(previousState, error),
        UnauthenticatedGymAdministratorError: () => redirectToSignIn,
        UnauthorizedGymAdministratorError: () =>
          presenter.presentForbidden(previousState),
        GymNotFoundError: () => presenter.presentNotFound(previousState),
        GymRouteNotFoundError: () =>
          presenter.presentNotFound(previousState),
      }),
      Effect.catchDefect(() =>
        presenter.presentUnexpectedError(previousState)
      )
    ),
  }
})
