import { Effect, Schema } from "effect"
import { JoinGymInputSchema } from "@gym/application/use-cases/join-gym"
import { Gym } from "@gym/component"
import { Headers, Navigation } from "@packages/effect-next"

import { JoinGymPresenter } from "../presenters/join-gym.presenter"
import type { JoinGymViewModel } from "../view-models/join-gym.view-model"

export const JoinGymController = Effect.fn("JoinGymController.make")(
  function* ({
    previousState,
    redirectUrl,
  }: {
    previousState: JoinGymViewModel
    redirectUrl: string
  }) {
    const gym = yield* Gym
    const cookies = yield* Headers.Cookies
    const presenter = yield* JoinGymPresenter
    const redirectToSignIn = Navigation.Redirect(redirectUrl)

    return {
      handle: Effect.fn("JoinGymController.handle")(
        function* (formData: FormData) {
          const authToken = cookies.get("authToken")

          if (!authToken?.value) {
            return yield* redirectToSignIn
          }

          const input = yield* Schema.decodeUnknownEffect(JoinGymInputSchema)(
            {
              token: authToken.value,
              ...Object.fromEntries(formData),
            },
            { errors: "all" }
          )
          const success = yield* gym.joinGym(input)

          return yield* presenter.presentSuccess(success)
        },
        Effect.catchTags({
          SchemaError: (error) =>
            presenter.presentSchemaError(previousState, error),
          UnauthenticatedGymMemberError: () => redirectToSignIn,
          GymNotFoundError: (error) =>
            presenter.presentNotFoundError(previousState, error),
          GymMembershipAlreadyExistsError: (error) =>
            presenter.presentAlreadyMemberError(previousState, error),
        }),
        Effect.catchDefect(() => presenter.presentUnexpectedError(previousState))
      ),
    }
  }
)
