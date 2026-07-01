import { Effect, Schema } from "effect"
import { CreateGymRouteInputSchema } from "@gym/application/use-cases/create-gym-route"
import { Gym } from "@gym/component"
import { Headers, Navigation } from "@packages/effect-next"

import { CreateGymRoutePresenter } from "../presenters/create-gym-route.presenter"
import type { CreateGymRouteViewModel } from "../view-models/create-gym-route.view-model"

export const CreateGymRouteController = Effect.fn(
  "CreateGymRouteController.make"
)(function* ({
  previousState,
  redirectUrl,
}: {
  previousState: CreateGymRouteViewModel
  redirectUrl: string
}) {
  const gym = yield* Gym
  const cookies = yield* Headers.Cookies
  const presenter = yield* CreateGymRoutePresenter
  const redirectToSignIn = Navigation.Redirect(redirectUrl)

  return {
    handle: Effect.fn("CreateGymRouteController.handle")(
      function* (formData: FormData) {
        const authToken = cookies.get("authToken")
        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const input = yield* Schema.decodeUnknownEffect(
          CreateGymRouteInputSchema
        )(
          {
            token: authToken.value,
            ...Object.fromEntries(formData),
          },
          { errors: "all" }
        )
        const success = yield* gym.createGymRoute(input)
        return yield* presenter.presentSuccess(success)
      },
      Effect.catchTags({
        SchemaError: (error) =>
          presenter.presentSchemaError(previousState, error),
        UnauthenticatedGymAdministratorError: () => redirectToSignIn,
        UnauthorizedGymAdministratorError: () =>
          presenter.presentForbidden(previousState),
        GymNotFoundError: () => presenter.presentNotFound(previousState),
        GymAreaNotFoundError: () => presenter.presentNotFound(previousState),
        GymRouteOrderAlreadyExistsError: () =>
          presenter.presentConflict(previousState),
        GymRouteBoulderNotAssignableError: () =>
          presenter.presentBoulderNotAssignable(previousState),
      }),
      Effect.catchDefect(() =>
        presenter.presentUnexpectedError(previousState)
      )
    ),
  }
})
