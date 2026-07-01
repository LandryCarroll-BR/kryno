import { Effect, Schema } from "effect"
import { CreateGymInputSchema } from "@gym/application/use-cases/create-gym"
import { Gym } from "@gym/component"
import { Headers, Navigation } from "@packages/effect-next"

import { CreateGymPresenter } from "../presenters/create-gym.presenter"
import type { CreateGymViewModel } from "../view-models/create-gym.view-model"

export const CreateGymController = Effect.fn("CreateGymController.make")(
  function* ({
    previousState,
    redirectUrl,
  }: {
    previousState: CreateGymViewModel
    redirectUrl: string
  }) {
    const gym = yield* Gym
    const cookies = yield* Headers.Cookies
    const presenter = yield* CreateGymPresenter
    const redirectToSignIn = Navigation.Redirect(redirectUrl)

    return {
      handle: Effect.fn("CreateGymController.handle")(
        function* (formData: FormData) {
          const authToken = cookies.get("authToken")

          if (!authToken?.value) {
            return yield* redirectToSignIn
          }

          const input = yield* Schema.decodeUnknownEffect(CreateGymInputSchema)(
            {
              token: authToken.value,
              ...Object.fromEntries(formData),
            },
            { errors: "all" }
          )

          const success = yield* gym.createGym(input)

          return yield* presenter.presentSuccess(success)
        },
        Effect.catchTags({
          SchemaError: (error) =>
            presenter.presentSchemaError(previousState, error),
          UnauthenticatedGymAdministratorError: () => redirectToSignIn,
          UnauthorizedGymAdministratorError: (error) =>
            presenter.presentUnauthorizedError(previousState, error),
        }),
        Effect.catchDefect(() =>
          presenter.presentUnexpectedError(previousState)
        )
      ),
    }
  }
)
