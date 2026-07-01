import { Effect, Schema } from "effect"
import { CreateGymAreaInputSchema } from "@gym/application/use-cases/create-gym-area"
import { Gym } from "@gym/component"
import { Headers, Navigation } from "@packages/effect-next"

import { CreateGymAreaPresenter } from "../presenters/create-gym-area.presenter"
import type { CreateGymAreaViewModel } from "../view-models/create-gym-area.view-model"

export const CreateGymAreaController = Effect.fn(
  "CreateGymAreaController.make"
)(function* ({
  previousState,
  redirectUrl,
}: {
  previousState: CreateGymAreaViewModel
  redirectUrl: string
}) {
  const gym = yield* Gym
  const cookies = yield* Headers.Cookies
  const presenter = yield* CreateGymAreaPresenter
  const redirectToSignIn = Navigation.Redirect(redirectUrl)

  return {
    handle: Effect.fn("CreateGymAreaController.handle")(
      function* (formData: FormData) {
        const authToken = cookies.get("authToken")
        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const input = yield* Schema.decodeUnknownEffect(
          CreateGymAreaInputSchema
        )(
          {
            token: authToken.value,
            ...Object.fromEntries(formData),
          },
          { errors: "all" }
        )
        const success = yield* gym.createGymArea(input)
        return yield* presenter.presentSuccess(success)
      },
      Effect.catchTags({
        SchemaError: (error) =>
          presenter.presentSchemaError(previousState, error),
        UnauthenticatedGymAdministratorError: () => redirectToSignIn,
        UnauthorizedGymAdministratorError: () =>
          presenter.presentForbidden(previousState),
        GymNotFoundError: () => presenter.presentNotFound(previousState),
        GymAreaNameAlreadyExistsError: () =>
          presenter.presentConflict(previousState),
      }),
      Effect.catchDefect(() =>
        presenter.presentUnexpectedError(previousState)
      )
    ),
  }
})
