import { Effect, Schema } from "effect"
import { EditGymRouteInputSchema } from "@gym/application/use-cases/edit-gym-route"
import { Gym } from "@gym/component"
import { Headers, Navigation } from "@packages/effect-next"

import { EditGymRoutePresenter } from "../presenters/edit-gym-route.presenter"
import type { EditGymRouteViewModel } from "../view-models/edit-gym-route.view-model"

export const EditGymRouteController = Effect.fn(
  "EditGymRouteController.make"
)(function* ({
  previousState,
  redirectUrl,
}: {
  previousState: EditGymRouteViewModel
  redirectUrl: string
}) {
  const gym = yield* Gym
  const cookies = yield* Headers.Cookies
  const presenter = yield* EditGymRoutePresenter
  const redirectToSignIn = Navigation.Redirect(redirectUrl)

  return {
    handle: Effect.fn("EditGymRouteController.handle")(
      function* (formData: FormData) {
        const authToken = cookies.get("authToken")
        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const routeImageFile = formData.get("routeImage")
        const routeImage =
          routeImageFile instanceof File && routeImageFile.size > 0
            ? {
                bytes: new Uint8Array(
                  yield* Effect.tryPromise(() =>
                    routeImageFile.arrayBuffer()
                  ).pipe(Effect.orDie)
                ),
                contentType: routeImageFile.type,
                fileName: routeImageFile.name || "route-image",
              }
            : undefined
        const formValues = Object.fromEntries(formData)
        delete formValues.routeImage

        const input = yield* Schema.decodeUnknownEffect(
          EditGymRouteInputSchema
        )(
          {
            token: authToken.value,
            ...formValues,
            ...(routeImage === undefined ? {} : { routeImage }),
          },
          { errors: "all" }
        )
        const success = yield* gym.editGymRoute(input)
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
        GymRouteNotFoundError: () =>
          presenter.presentNotFound(previousState),
        GymRouteOrderAlreadyExistsError: () =>
          presenter.presentConflict(previousState),
      }),
      Effect.catchDefect(() =>
        presenter.presentUnexpectedError(previousState)
      )
    ),
  }
})
