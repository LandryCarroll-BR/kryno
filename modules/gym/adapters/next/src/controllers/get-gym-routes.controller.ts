import { Effect, Schema } from "effect"
import { GetGymRoutesInputSchema } from "@gym/application/use-cases/get-gym-routes"
import { Gym } from "@gym/component"
import { Headers, Navigation } from "@packages/effect-next"

import { GetGymRoutesPresenter } from "../presenters/get-gym-routes.presenter"

export const GetGymRoutesController = Effect.fn(
  "GetGymRoutesController.make"
)(function* ({
  gymId,
  redirectUrl,
}: {
  gymId: string
  redirectUrl: string
}) {
  const gym = yield* Gym
  const cookies = yield* Headers.Cookies
  const presenter = yield* GetGymRoutesPresenter
  const redirectToSignIn = Navigation.Redirect(redirectUrl)

  return {
    handle: Effect.fn("GetGymRoutesController.handle")(
      function* () {
        const authToken = cookies.get("authToken")
        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const input = yield* Schema.decodeUnknownEffect(
          GetGymRoutesInputSchema
        )(
          { token: authToken.value, gymId },
          { errors: "all" }
        )
        const success = yield* gym.getGymRoutes(input)
        return yield* presenter.presentSuccess(success)
      },
      Effect.catchTags({
        SchemaError: (error) => presenter.presentSchemaError(error),
        UnauthenticatedGymMemberError: () => redirectToSignIn,
        GymNotFoundError: () => Navigation.NotFound,
      }),
      Effect.catchDefect(() => presenter.presentUnexpectedError())
    ),
  }
})
