import { Effect, Schema } from "effect"
import { ListGymsInputSchema } from "@gym/application/use-cases/list-gyms"
import { Gym } from "@gym/component"
import { Headers, Navigation } from "@packages/effect-next"

import { ListGymsPresenter } from "../presenters/list-gyms.presenter"

export const ListGymsController = Effect.fn("ListGymsController.make")(
  function* ({ redirectUrl }: { redirectUrl: string }) {
    const gym = yield* Gym
    const cookies = yield* Headers.Cookies
    const presenter = yield* ListGymsPresenter
    const redirectToSignIn = Navigation.Redirect(redirectUrl)

    return {
      handle: Effect.fn("ListGymsController.handle")(
        function* () {
          const authToken = cookies.get("authToken")

          if (!authToken?.value) {
            return yield* redirectToSignIn
          }

          const input = yield* Schema.decodeUnknownEffect(ListGymsInputSchema)(
            {
              token: authToken.value,
            },
            { errors: "all" }
          )
          const success = yield* gym.listGyms(input)

          return yield* presenter.presentSuccess(success)
        },
        Effect.catchTags({
          SchemaError: (error) => presenter.presentSchemaError(error),
          UnauthenticatedGymMemberError: () => redirectToSignIn,
        }),
        Effect.catchDefect(() => presenter.presentUnexpectedError())
      ),
    }
  }
)
